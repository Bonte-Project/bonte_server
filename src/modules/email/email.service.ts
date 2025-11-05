import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

export const sendVerificationEmail = async (to: string, code: string) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify Your Email</h1>
        <p>Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
          <h2 style="font-size: 32px; letter-spacing: 8px; color: #007bff; margin: 0;">${code}</h2>
        </div>
        <p style="margin-top: 20px;">This code will expire in <strong>1 hour</strong>.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Bonte" <${process.env.BREVO_FROM}>`,
      to,
      subject: 'Email Verification Code',
      html,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
    }

    throw new Error('Failed to send verification email');
  }
};
