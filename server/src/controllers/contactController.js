import { ContactMessage } from "../models/ContactMessage.js";
import { sendContactNotification } from "../services/mailer.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const createContactMessage = async (req, res, next) => {
  try {
    const name = req.body?.name?.trim?.() || "";
    const email = req.body?.email?.trim?.() || "";
    const subject = req.body?.subject?.trim?.() || "";
    const message = req.body?.message?.trim?.() || "";

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email." });
    }

    const saved = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    // Send email in the background so API response is not delayed by SMTP latency.
    sendContactNotification({
      name,
      email,
      subject,
      message,
    }).catch((error) => {
      console.error("Background email notification failed:", error.message);
    });

    return res.status(201).json({
      message: "Your message has been sent successfully.",
      id: saved._id,
    });
  } catch (error) {
    next(error);
  }
};
