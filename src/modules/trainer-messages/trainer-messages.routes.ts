import { Router } from 'express';
import {
  createTrainerMessageHandler,
  getTrainerMessagesHandler,
  getChatListHandler,
  pollNewMessagesHandler,
} from './trainer-messages.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TrainerMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the message.
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the user.
 *         trainer_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the trainer.
 *         message:
 *           type: string
 *           description: The content of the message.
 *         sent_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the message was sent.
 *         to_from:
 *           type: boolean
 *           description: "Direction of the message: true for user to trainer, false for trainer to user."
 */

/**
 * @swagger
 * /trainer-messages/poll/new:
 *   get:
 *     summary: Poll for new messages
 *     description: |
 *       Waits for a new message to arrive for the authenticated user.
 *       This endpoint holds the connection open until a new message is available or a timeout occurs (120 seconds).
 *       If a new message arrives, it is returned immediately.
 *       If the connection times out, it returns a 204 No Content status.
 *     tags:
 *       - Trainer Messages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A new message was received.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrainerMessage'
 *       204:
 *         description: No new message received within the timeout period.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/poll/new', authMiddleware, pollNewMessagesHandler);

/**
 * @swagger
 * /trainer-messages/{id}:
 *   get:
 *     summary: Get messages with another user/trainer
 *     description: |
 *       Returns all messages between the current authenticated user/trainer and another party.
 *       If the authenticated user is a 'user', the {id} parameter should be the trainer's ID.
 *       If the authenticated user is a 'trainer', the {id} parameter should be the user's ID.
 *     tags:
 *       - Trainer Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the other party (trainer's ID for a user, or user's ID for a trainer).
 *     responses:
 *       200:
 *         description: Messages fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Messages fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TrainerMessage'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Not Found.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authMiddleware, getTrainerMessagesHandler);

/**
 * @swagger
 * /trainer-messages/{id}:
 *   post:
 *     summary: Send a message to another user/trainer
 *     description: |
 *       Sends a message from the current authenticated user/trainer to another party.
 *       The `to_from` field in the body determines the direction, `true` for USER - TRAINER, `false` for TRAINER - USER.
 *     tags:
 *       - Trainer Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the recipient.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - to_from
 *             properties:
 *               message:
 *                 type: string
 *               to_from:
 *                 type: boolean
 *                 description: "true = user to trainer, false = trainer to user"
 *     responses:
 *       201:
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *                 data:
 *                   $ref: '#/components/schemas/TrainerMessage'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Not Found.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id', authMiddleware, createTrainerMessageHandler);

/**
 * @swagger
 * /trainer-messages/chats/list:
 *   get:
 *     summary: Get a list of all chat partners
 *     description: |
 *       Returns a list of IDs for all users or trainers the current authenticated user has a chat with.
 *       If the authenticated user is a 'user', it returns a list of trainer IDs.
 *       If the authenticated user is a 'trainer', it returns a list of user IDs.
 *     tags:
 *       - Trainer Messages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat list fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Not Found.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/chats/list', authMiddleware, getChatListHandler);

export default router;
