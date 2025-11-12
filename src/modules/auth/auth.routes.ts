import { Router } from 'express';
import { register, verifyEmail, googleRegister, googleLogin } from './auth.controller';
import {
  register,
  verifyEmail,
  googleRegister,
  login,
  refreshToken,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from './auth.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - password
 *         - role
 *       properties:
 *         fullName:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: SecureP@ssw0rd
 *         role:
 *           type: string
 *           enum: [admin, user, moderator]
 *           example: user
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Registration successful. Please check your email for verification code.
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *
 *     VerifyEmailRequest:
 *       type: object
 *       required:
 *         - email
 *         - code
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         code:
 *           type: string
 *           pattern: '^\d{4}$'
 *           example: "1234"
 *
 *     VerifyEmailResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Email verified successfully
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: SecureP@ssw0rd
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Login successful
 *         accessToken:
 *           type: string
 *           example: jwt-access-token-here
 *
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: new-jwt-access-token
 *         message:
 *           type: string
 *           example: Token refreshed successfully
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Missing required fields
 *
 *   responses:
 *     BadRequest:
 *       description: Bad request - Invalid input data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     Conflict:
 *       description: Conflict - Resource already exists
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     Unauthorized:
 *       description: Unauthorized - Invalid credentials or token
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends a verification code to the provided email address
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user email
 *     description: Verifies a user's email address using the 4-digit code sent during registration
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailRequest'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyEmailResponse'
 *       400:
 *         description: Bad request - Invalid or expired verification code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: Email and verification code are required
 *               invalidFormat:
 *                 value:
 *                   message: Verification code must be 4 digits
 *               invalidCode:
 *                 value:
 *                   message: Invalid or expired verification code
 *               userNotFound:
 *                 value:
 *                   message: User not found
 *               alreadyVerified:
 *                 value:
 *                   message: Email already verified
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/verify-email', verifyEmail);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user and returns access and refresh tokens.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Uses the refresh token from cookies to issue a new access token.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Invalid or expired refresh token
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Register or login with Google
 *     description: Accepts a Google OAuth token, verifies it, and registers/logs in the user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google OAuth token
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6...
 *     responses:
 *       201:
 *         description: Google registration/login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Google registration successful
 *                 token:
 *                   type: string
 *                   example: jwt-token-here
 *       400:
 *         description: Bad request - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/google', googleRegister);

/**
 * @swagger
 * /auth/google/login:
 *   post:
 *     summary: Login with Google
 *     description: Accepts a Google OAuth token and logs in the user
 *     tags:
 *       - Authentication
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a 4-digit password reset code to the user's email if the email exists in the system.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google OAuth token
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6...
 *     responses:
 *       200:
 *         description: Google login successful
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Password reset code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Google login successful
 *                 token:
 *                   type: string
 *                   example: jwt-token-here
 *       400:
 *         description: Bad request - Missing or invalid token
 *                   example: Password reset code sent. Please check your email.
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: john.doe@example.com
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *         description: Invalid email format or missing email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/google/login', googleLogin);
 /*             examples:
 *               missingEmail:
 *                 value:
 *                   message: Email is required
 *               invalidEmail:
 *                 value:
 *                   message: Invalid email format
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: User with this email not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /auth/verify-reset-code:
 *   post:
 *     summary: Verify password reset code
 *     description: Validates the 4-digit code sent to the user's email for password reset.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               code:
 *                 type: string
 *                 pattern: '^\d{4}$'
 *                 example: "1234"
 *                 description: 4-digit numeric code
 *     responses:
 *       200:
 *         description: Reset code verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Code verified. You can now reset your password.
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *         description: Invalid input (email, code format, or code not 4 digits)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: Email and code are required
 *               invalidEmail:
 *                 value:
 *                   message: Invalid email format
 *               invalidCode:
 *                 value:
 *                   message: Code must contain only digits
 *               expiredOrInvalid:
 *                 value:
 *                   message: Invalid or expired code
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/verify-reset-code', verifyResetCode);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password using a valid reset code (must be verified first via `/verify-reset-code`).
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: NewSecureP@ss123
 *                 description: New password (minimum 6 characters recommended)
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password successfully reset. You can now log in.
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *         description: Invalid input or code not verified/expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: Email and new password are required
 *               invalidEmail:
 *                 value:
 *                   message: Invalid email format
 *               invalidCode:
 *                 value:
 *                   message: Invalid or expired code
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/reset-password', resetPassword);

export default router;
