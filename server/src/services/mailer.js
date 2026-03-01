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

  const isConfigured = Boolean(host && port && user && pass && from);

  return {
    host,
    port,
    user,
    pass,
    from,
    to,
    secure,
    forceIpv4,
    isConfigured,
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

export const sendContactNotification = async ({
  name,
  email,
  subject,
  message,
}) => {
  const config = getMailConfig();
  if (!config.isConfigured || !config.to) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const transporter = await createTransporter(config);

    await transporter.sendMail({
      from: config.from,
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

    return { sent: true };
  } catch (error) {
    console.error("Email notification failed:", error.message);
    return { sent: false, reason: "send_failed" };
  }
};

export const sendVerificationCodeEmail = async ({ email, name, code }) => {
  const config = getMailConfig();
  if (!config.isConfigured) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const transporter = await createTransporter(config);
    await transporter.sendMail({
      from: config.from,
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
    return { sent: true };
  } catch (error) {
    console.error("Verification email failed:", error.message);
    return { sent: false, reason: "send_failed" };
  }
};
