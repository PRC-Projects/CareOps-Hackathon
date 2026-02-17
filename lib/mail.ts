// lib/mail.ts
import nodemailer from "nodemailer";

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://careops-platform-hackathon.vercel.app/";

// 1. Configure the Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // The App Password
  },
});

// Helper to send mail
async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"CareOps Platform" <${process.env.SMTP_USER}>`, // Sender address
      to,
      subject,
      html,
    });
    console.log("✅ Email sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Email failed:", error);
    return { error };
  }
}

// 2. Exported Functions (Same signature as before, so other files don't break)

export async function sendStaffInviteEmail(email: string, token: string, orgName: string) {
  const link = `${DOMAIN}/join/${token}`;
  
  return await sendMail({
    to: email,
    subject: `Join ${orgName} on CareOps`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You have been invited!</h2>
        <p>You have been invited to join <strong>${orgName}</strong> as a staff member.</p>
        <p>Click the link below to accept and create your account:</p>
        <a href="${link}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invite</a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">Link: ${link}</p>
      </div>
    `
  });
}

export async function sendBookingConfirmation(email: string, name: string, date: string, service: string) {
  return await sendMail({
    to: email,
    subject: 'Booking Confirmed! ✅',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name},</h2>
        <p>Your booking for <strong>${service}</strong> has been confirmed.</p>
        <p style="font-size: 16px; background: #f3f4f6; padding: 15px; border-radius: 8px;">
          <strong>📅 When:</strong> ${date}
        </p>
        <p>See you soon!</p>
      </div>
    `
  });
}

export async function sendBookingCancellation(email: string, name: string, service: string, reason: string) {
  return await sendMail({
    to: email,
    subject: 'Booking Cancelled ❌',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name},</h2>
        <p>Unfortunately, your booking for <strong>${service}</strong> has been cancelled.</p>
        <blockquote style="border-left: 4px solid #ef4444; padding-left: 10px; color: #555;">
          ${reason}
        </blockquote>
        <p>Please visit our page to reschedule.</p>
      </div>
    `
  });
}