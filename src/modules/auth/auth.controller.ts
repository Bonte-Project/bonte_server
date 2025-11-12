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

export const login: ExpressHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ message: 'Invalid data format' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    // if (password.length < 6) {
    //   res.status(400).json({ message: 'Password must be at least 6 characters long' });
    //   return;
    // }

    const { accessToken, refreshToken } = await authService.login({
      email: normalizedEmail,
      password,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
    });
  } catch (error) {
    console.error('Error in login:', error);
    const errorMessage = extractErrorMessage(error);

    if (errorMessage === 'User not found') {
      res.status(404).json({ message: 'User with this email does not exist' });
      return;
    }

    if (errorMessage === 'Incorrect password') {
      res.status(401).json({ message: 'Incorrect password' });
      return;
    }

    if (errorMessage === 'Please verify your email') {
      res.status(403).json({ message: 'Please verify your email before logging in' });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshToken: ExpressHandler = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      res.status(401).json({ message: 'Missing refresh token' });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens({
      refreshToken: token,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken,
    });
  } catch (error) {
    console.error('Error in refreshToken:', error);
    const errorMessage = extractErrorMessage(error);

    if (errorMessage === 'Invalid or expired refresh token') {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    if (errorMessage === 'User not found') {
      res.status(404).json({ message: 'User not found' });
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
export const forgotPassword: ExpressHandler = async (req, res) => {
  try {
    console.log('forgotPassword request:', req.body);

    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    if (typeof email !== 'string') {
      res.status(400).json({ message: 'Invalid data format' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    await authService.forgotPassword(normalizedEmail);

    res.status(200).json({
      message: 'Password reset code sent. Please check your email.',
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    const errorMessage = extractErrorMessage(error);

    if (errorMessage === 'User not found') {
      res.status(404).json({ message: 'User with this email not found' });
      return;
    }

    if (errorMessage === 'Failed to send password reset email') {
      res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyResetCode: ExpressHandler = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ message: 'Email and code are required' });
      return;
    }

    if (typeof email !== 'string' || typeof code !== 'string') {
      res.status(400).json({ message: 'Invalid data format' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    const trimmedCode = code.trim();
    if (!/^\d{4}$/.test(trimmedCode)) {
      res.status(400).json({ message: 'Code must contain only digits' });
      return;
    }

    await authService.verifyResetCode(normalizedEmail, trimmedCode);

    res.status(200).json({
      message: 'Code verified. You can now reset your password.',
    });
  } catch (error) {
    console.error('Error in verifyResetCode:', error);
    const errorMessage = extractErrorMessage(error);

    if (errorMessage === 'User not found') {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (errorMessage === 'Invalid or expired code') {
      res.status(400).json({ message: 'Invalid or expired code' });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword: ExpressHandler = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ message: 'Email and new password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    await authService.resetPassword(normalizedEmail, newPassword);

    res.status(200).json({
      message: 'Password successfully reset. You can now log in.',
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    const errorMessage = extractErrorMessage(error);

    if (errorMessage === 'User not found') {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (errorMessage === 'Invalid or expired code') {
      res.status(400).json({ message: 'Invalid or expired code' });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};
