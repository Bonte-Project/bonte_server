import { Router } from 'express';
import { me, updateMe } from './users.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         fullName:
 *           type: string
 *         avatarUrl:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           enum: [user, trainer, admin]
 *         isEmailVerified:
 *           type: boolean
 *         height:
 *           type: integer
 *           nullable: true
 *         weight:
 *           type: integer
 *           nullable: true
 *         age:
 *           type: integer
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         isPremium:
 *           type: boolean
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *         avatarUrl:
 *           type: string
 *           nullable: true
 *         height:
 *           type: integer
 *           nullable: true
 *         weight:
 *           type: integer
 *           nullable: true
 *         age:
 *           type: integer
 *           nullable: true
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *   responses:
 *     UnauthorizedError:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: Missing or invalid token
 *     InternalServerError:
 *       description: Internal Server Error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: Internal server error
 *     BadRequestError:
 *       description: Bad Request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: Invalid input
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns data of the user associated with the provided access token
 *     tags:
 *       - Users
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me', authMiddleware, me);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current authenticated user
 *     description: Updates data of the user associated with the provided access token
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: User data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User data updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/me', authMiddleware, updateMe);

export default router;
