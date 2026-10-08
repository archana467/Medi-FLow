import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST) {
    console.log(`Mock sending email to ${to}: ${subject}`);
    return true; // Skip actual sending if SMTP is not configured
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"MediFlow" <noreply@mediflow.com>',
    to,
    subject,
    html
  });
  return info;
};
