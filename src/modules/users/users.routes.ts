import { Router } from 'express';
import { me } from './users.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns data of the user associated with the provided access token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User data fetched successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingToken:
 *                 value:
 *                   message: Authorization header missing or malformed
 *               invalidToken:
 *                 value:
 *                   message: Invalid or expired token
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me', authMiddleware, me);

export default router;
