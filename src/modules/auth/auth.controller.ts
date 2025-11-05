import { ExpressHandler } from '../../shared/types/express.type';
import { extractErrorMessage } from '../../shared/utils/error.util';
import * as authService from './auth.service';

export const register: ExpressHandler = async (req, res) => {
  try {
    console.log('register');
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    await authService.register({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('Error in register:', error);
    const errorMessage = extractErrorMessage(error);

    if (errorMessage === 'User already exists') {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    if (errorMessage.includes('Invalid role')) {
      res.status(400).json({ message: errorMessage });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyEmail: ExpressHandler = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ message: 'Email and verification code are required' });
      return;
    }

    if (typeof email !== 'string' || typeof code !== 'string') {
      res.status(400).json({ message: 'Invalid data format' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (trimmedCode.length !== 4) {
      res.status(400).json({ message: 'Verification code must be 4 digits' });
      return;
    }

    if (!/^\d{4}$/.test(trimmedCode)) {
      res.status(400).json({ message: 'Verification code must contain only digits' });
      return;
    }

    await authService.verifyEmail(normalizedEmail, trimmedCode);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    const errorMessage = extractErrorMessage(error);

    if (errorMessage === 'User not found') {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    if (errorMessage === 'Email already verified') {
      res.status(400).json({ message: 'Email already verified' });
      return;
    }

    if (errorMessage === 'Invalid or expired verification code') {
      res.status(400).json({ message: 'Invalid or expired verification code' });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const googleRegister: ExpressHandler = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ message: 'Google OAuth token is required' });
      return;
    }

    const result = await authService.googleRegister(token);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in googleRegister:', error);
    const errorMessage = extractErrorMessage(error);
    res.status(500).json({ message: errorMessage || 'Internal server error' });
  }
};
