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

export const sendPasswordResetEmail = async (to: string, code: string) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc3545; text-align: center;">Password Reset Request</h1>
        <p>We received a request to reset the password for your <strong>Bonte</strong> account.</p>
        
        <p>To confirm this is your email and proceed with resetting your password, please enter the following code:</p>
        
        <div style="background: #fff5f5; padding: 24px; text-align: center; border-radius: 10px; border: 2px dashed #dc3545; margin: 24px 0;">
          <h2 style="font-size: 36px; letter-spacing: 10px; color: #dc3545; margin: 0; font-weight: bold;">
            ${code}
          </h2>
        </div>

        <p style="background: #f8d7da; color: #721c24; padding: 12px; border-radius: 6px; font-size: 14px;">
          <strong>Important:</strong> This code will expire in <strong>1 hour</strong> for security reasons.
        </p>

        <p>If you did <strong>not</strong> request a password reset, you can safely ignore this email. No changes will be made to your account.</p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />

        <p style="color: #888; font-size: 12px; text-align: center;">
          This is an automated message — please do not reply. Need help? Contact support.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Bonte Security" <${process.env.BREVO_FROM}>`,
      to,
      subject: 'Your Password Reset Code',
      html,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to send password reset email:', error.message);
    }
    throw new Error('Failed to send password reset email');
  }
};
