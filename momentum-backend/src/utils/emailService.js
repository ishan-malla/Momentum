import nodemailer from "nodemailer";
import {
  generateOTPEmail,
  generateWelcomeEmail,
  generateTaskReminderEmail,
} from "./emailTemplates.js";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOTPEmail = async (email, otp, username) => {
  try {
    const html = generateOTPEmail({
      userName: username,
      otpCode: otp,
      expiryMinutes: 10,
    });

    await transporter.sendMail({
      from: `"Momentum" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("OTP email error:", error);
    return { success: false };
  }
};

export const sendWelcomeEmail = async (email, username) => {
  try {
    console.log(email, username);
    const html = generateWelcomeEmail({
      userName: username,
    });

    await transporter.sendMail({
      from: `"Momentum" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Momentum 🎉",
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Welcome email error:", error);
    return { success: false };
  }
};

export const sendTaskReminderEmail = async (email, username, task) => {
  try {
    const html = generateTaskReminderEmail({
      userName: username,
      taskName: task.name,
      scheduledDate: task.scheduledDate,
      scheduledTime: task.scheduledTime,
      frequency: task.frequency,
      reminderOffsetDays: task.reminderOffsetDays ?? 0,
    });

    await transporter.sendMail({
      from: `"Momentum" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Task Reminder",
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Task reminder email error:", error);
    return { success: false };
  }
};
