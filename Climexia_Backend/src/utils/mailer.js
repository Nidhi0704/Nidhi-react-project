'use strict';
const nodemailer = require('nodemailer');

const createTransport = () => {
  // If SMTP credentials are not configured, log to console (dev mode)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMail = async ({ to, subject, html }) => {
  const transporter = createTransport();

  const from = `"${process.env.FROM_NAME || 'Climexia'}" <${process.env.FROM_EMAIL || 'noreply@climexia.in'}>`;

  if (!transporter) {
    // Development: log email to console instead of sending
    console.log('\n📧 [DEV EMAIL LOG]');
    console.log(`   To      : ${to}`);
    console.log(`   From    : ${from}`);
    console.log(`   Subject : ${subject}`);
    console.log(`   Body    : ${html}\n`);
    return;
  }

  await transporter.sendMail({ from, to, subject, html });
};

// ── Email templates ──────────────────────────────────────────────────────────

const sendWelcomeEmail = (user) =>
  sendMail({
    to: user.email,
    subject: 'Welcome to Climexia!',
    html: `<p>Hi ${user.firstName}, welcome to Climexia — India's smart HVAC platform!</p>`,
  });

const sendPasswordResetEmail = (email, resetUrl) =>
  sendMail({
    to: email,
    subject: 'Reset your Climexia password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });

const sendBookingConfirmation = (user, booking) =>
  sendMail({
    to: user.email,
    subject: `Booking Confirmed — ${booking.bookingId}`,
    html: `<p>Your booking <strong>${booking.bookingId}</strong> is confirmed. We'll see you on ${booking.scheduledDate}.</p>`,
  });

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmation,
};