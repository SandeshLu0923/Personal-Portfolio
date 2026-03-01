import nodemailer from "nodemailer";

const getMailConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const to = process.env.SMTP_TO;
  const secure = process.env.SMTP_SECURE === "true";

  const isConfigured = Boolean(host && port && user && pass && from && to);

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

export const sendContactNotification = async ({
  name,
  email,
  subject,
  message,
}) => {
  const config = getMailConfig();
  if (!config.isConfigured) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

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
