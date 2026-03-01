import nodemailer from "nodemailer";

const getMailConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const to = process.env.SMTP_TO;
  const secure = process.env.SMTP_SECURE === "true";

  const isConfigured = Boolean(host && port && user && pass && from);

  return {
    host,
    port,
    user,
    pass,
    from,
    to,
    secure,
    isConfigured,
  };
};

const createTransporter = (config) =>
  nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

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
    const transporter = createTransporter(config);

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
    const transporter = createTransporter(config);
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
