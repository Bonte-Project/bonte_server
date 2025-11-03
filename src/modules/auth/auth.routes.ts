import { Router } from 'express';
import { register, verifyEmail } from './auth.controller';

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
 *           description: User's full name
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *           minLength: 8
 *           example: SecureP@ssw0rd
 *         role:
 *           type: string
 *           enum: [admin, user, moderator]
 *           description: User role
 *           example: user
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Registration successful. Please check your email for verification code.
 *
 *     VerifyEmailRequest:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           pattern: '^\d{4}$'
 *           description: 4-digit verification code sent to user's email
 *           example: "1234"
 *
 *     VerifyEmailResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Email verified successfully
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: Missing required fields
 *
 *   responses:
 *     BadRequest:
 *       description: Bad request - Invalid input data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             missingFields:
 *               value:
 *                 message: Missing required fields
 *             invalidRole:
 *               value:
 *                 message: Invalid role. Must be one of admin, user, moderator
 *             invalidCode:
 *               value:
 *                 message: Verification code must be 4 digits
 *
 *     Conflict:
 *       description: Conflict - Resource already exists
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: User with this email already exists
 *
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: Internal server error
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
 *               missingCode:
 *                 value:
 *                   message: Verification code is required
 *               invalidFormat:
 *                 value:
 *                   message: Verification code must be 4 digits
 *               invalidCode:
 *                 value:
 *                   message: Invalid or expired verification code
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/verify-email', verifyEmail);

export default router;
