import dns from "dns/promises";
import nodemailer from "nodemailer";

const getMailConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const to = process.env.SMTP_TO;
  const secure = process.env.SMTP_SECURE === "true";
  const forceIpv4 = process.env.FORCE_SMTP_IPV4 !== "false";

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;

  const isSmtpConfigured = Boolean(host && port && user && pass && from);
  const isResendConfigured = Boolean(resendApiKey && resendFrom);

  return {
    host,
    port,
    user,
    pass,
    from,
    to,
    secure,
    forceIpv4,
    resendApiKey,
    resendFrom,
    isSmtpConfigured,
    isResendConfigured,
    isConfigured: isSmtpConfigured || isResendConfigured,
  };
};

const createTransporter = async (config) => {
  let resolvedHost = config.host;

  if (config.forceIpv4) {
    try {
      const ipv4Records = await dns.resolve4(config.host);
      if (ipv4Records.length > 0) {
        resolvedHost = ipv4Records[0];
      }
    } catch (error) {
      console.warn("SMTP IPv4 resolve failed, using hostname fallback:", error.message);
    }
  }

  return nodemailer.createTransport({
    host: resolvedHost,
    port: config.port,
    secure: config.secure,
    name: config.host,
    family: config.forceIpv4 ? 4 : undefined,
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    tls: {
      servername: config.host,
    },
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

const sendViaResend = async ({ apiKey, from, to, subject, text, replyTo }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      reply_to: replyTo,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error: ${response.status} ${body}`);
  }
};

const sendEmail = async ({ config, to, subject, text, replyTo }) => {
  if (!config.isConfigured) {
    return { sent: false, reason: "not_configured" };
  }

  if (config.isSmtpConfigured) {
    try {
      const transporter = await createTransporter(config);
      await transporter.sendMail({
        from: config.from,
        to,
        replyTo,
        subject,
        text,
      });
      return { sent: true, provider: "smtp" };
    } catch (error) {
      console.error("SMTP email failed:", error.message);
      if (!config.isResendConfigured) {
        return { sent: false, reason: "send_failed" };
      }
    }
  }

  if (config.isResendConfigured) {
    try {
      await sendViaResend({
        apiKey: config.resendApiKey,
        from: config.resendFrom,
        to,
        subject,
        text,
        replyTo,
      });
      return { sent: true, provider: "resend" };
    } catch (error) {
      console.error("Resend email failed:", error.message);
      return { sent: false, reason: "send_failed" };
    }
  }

  return { sent: false, reason: "send_failed" };
};

export const sendContactNotification = async ({
  name,
  email,
  subject,
  message,
}) => {
  const config = getMailConfig();
  if (!config.to) {
    return { sent: false, reason: "not_configured" };
  }

  return sendEmail({
    config,
    to: config.to,
    replyTo: email,
    subject: `Portfolio Contact: ${subject}`,
    text: [
      "New portfolio contact message:",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      "Message:",
      message,
    ].join("\n"),
  });
};

export const sendVerificationCodeEmail = async ({ email, name, code }) => {
  const config = getMailConfig();

  return sendEmail({
    config,
    to: email,
    subject: "Verify your portfolio account",
    text: [
      `Hi ${name || "there"},`,
      "",
      "Your verification code is:",
      code,
      "",
      "This code expires in 15 minutes.",
    ].join("\n"),
  });
};
