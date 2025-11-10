import { ExpressHandler } from '../../shared/types/express.type';
import { extractErrorMessage } from '../../shared/utils/error.util';
import * as authService from './auth.service';

export const register: ExpressHandler = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    await authService.register({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
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
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ message: 'Verification code is required' });
      return;
    }

    if (typeof code !== 'string') {
      res.status(400).json({ message: 'Invalid code format' });
      return;
    }

    const trimmedCode = code.trim();

    if (trimmedCode.length !== 4) {
      res.status(400).json({ message: 'Verification code must be 4 digits' });
      return;
    }

    if (!/^\d{4}$/.test(trimmedCode)) {
      res.status(400).json({ message: 'Verification code must contain only digits' });
      return;
    }

    await authService.verifyEmail(trimmedCode);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    const errorMessage = extractErrorMessage(error);

    if (errorMessage === 'Invalid code format') {
      res.status(400).json({ message: 'Invalid verification code format' });
      return;
    }

    if (errorMessage === 'Invalid or expired code') {
      res.status(400).json({ message: 'Invalid or expired verification code' });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const googleRegister: ExpressHandler = async (req, res) => {
  try {
    const { code, role } = req.body;
    if (!code || !role) {
      res.status(400).json({ message: 'Google OAuth code and role are required' });
      return;
    }
    const result = await authService.googleAuth({ code, role });
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
      googleUser: result.googleUser,
    });
  } catch (error) {
    console.error('Error in googleRegister:', error);
    const errorMessage = extractErrorMessage(error);
    res.status(500).json({ message: errorMessage || 'Internal server error' });
  }
};

export const googleLogin: ExpressHandler = async (req, res) => {
  try {
    const { code, role } = req.body;
    if (!code || !role) {
      res.status(400).json({ message: 'Google OAuth code and role are required' });
      return;
    }
    const result = await authService.googleAuth({ code, role });
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
      googleUser: result.googleUser,
    });
  } catch (error) {
    console.error('Error in googleLogin:', error);
    const errorMessage = extractErrorMessage(error);
    res.status(500).json({ message: errorMessage || 'Internal server error' });
  }
};
