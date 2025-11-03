import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Email Verification Code',
    html: `
      <h1>Verify Your Email</h1>
      <p>Your verification code is:</p>
      <h2 style="font-size: 24px; letter-spacing: 4px;">${code}</h2>
      <p>This code will expire in <strong>1 hour</strong>.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
