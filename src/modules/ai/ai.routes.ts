import { Router } from 'express';
import {
  createConversation,
  getConversationHistory,
  sendMessage,
  getVisibleConversationHistory,
} from './ai.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/send-message', sendMessage);
router.get('/chat/visible-history', getVisibleConversationHistory);
router.get('/chat/history', getConversationHistory);
router.post('/create-chat', createConversation);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/ai/create-chat:
 *   post:
 *     summary: Create a new AI conversation for health tracking
 *     description: Creates a new AI conversation for the authenticated user, initializing it with user profile data, nutrition goals, and complete history of meals, activities, and sleep logs. The AI will have access to all historical data for analysis.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Optional title for the conversation
 *                 example: "Health Tracking Chat"
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Conversation created with property analysis"
 *             example:
 *               message: "Conversation created with property analysis"
 *       404:
 *         description: User or system prompt not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               examples:
 *                 userNotFound:
 *                   value:
 *                     message: "User not found"
 *                 promptNotFound:
 *                   value:
 *                     message: "Default system prompt not found"
 *       409:
 *         description: User already has an active conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User already has an active conversation"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/ai/chat/history:
 *   get:
 *     summary: Get complete conversation history
 *     description: Retrieves the full message history including the initial system message with user context. This endpoint returns all messages in chronological order with their indices.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversation history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             description: Unique identifier of the message
 *                           message:
 *                             type: string
 *                             description: Content of the message
 *                           sentAt:
 *                             type: string
 *                             format: date-time
 *                             description: Timestamp when message was sent
 *                           toFrom:
 *                             type: boolean
 *                             description: True if message is from user, false if from AI
 *                           sender:
 *                             type: string
 *                             enum: [user, ai]
 *                             description: Identifies who sent the message
 *                           index:
 *                             type: integer
 *                             description: Sequential position in conversation
 *             example:
 *               messages:
 *                 messages:
 *                   - id: "123e4567-e89b-12d3-a456-426614174000"
 *                     message: "I have analyzed your entire history of meals, workouts, and sleep. I can see your long-term trends. What would you like to review?"
 *                     sentAt: "2025-11-29T10:00:00Z"
 *                     toFrom: false
 *                     sender: "ai"
 *                     index: 0
 *                   - id: "456e7890-e89b-12d3-a456-426614174001"
 *                     message: "What did I eat yesterday?"
 *                     sentAt: "2025-11-29T10:05:00Z"
 *                     toFrom: true
 *                     sender: "user"
 *                     index: 1
 *                   - id: "789e1234-e89b-12d3-a456-426614174002"
 *                     message: "Yesterday you had: BREAKFAST: Oatmeal (350 kcal)..."
 *                     sentAt: "2025-11-29T10:05:15Z"
 *                     toFrom: false
 *                     sender: "ai"
 *                     index: 2
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with this id does not exist"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/ai/chat/visible-history:
 *   get:
 *     summary: Get visible conversation history
 *     description: Retrieves message history excluding the initial system/welcome message. This endpoint is used to display the conversation to users, showing only user-AI message exchanges.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Visible conversation history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             description: Unique identifier of the message
 *                           message:
 *                             type: string
 *                             description: Content of the message
 *                           sentAt:
 *                             type: string
 *                             format: date-time
 *                             description: Timestamp when message was sent
 *                           toFrom:
 *                             type: boolean
 *                             description: True if message is from user, false if from AI
 *                           sender:
 *                             type: string
 *                             enum: [user, ai]
 *                             description: Identifies who sent the message
 *                           index:
 *                             type: integer
 *                             description: Sequential position in conversation (starting from 0 after filtering)
 *             example:
 *               messages:
 *                 messages:
 *                   - id: "456e7890-e89b-12d3-a456-426614174001"
 *                     message: "What did I eat yesterday?"
 *                     sentAt: "2025-11-29T10:05:00Z"
 *                     toFrom: true
 *                     sender: "user"
 *                     index: 1
 *                   - id: "789e1234-e89b-12d3-a456-426614174002"
 *                     message: "Yesterday you had: BREAKFAST: Oatmeal (350 kcal)..."
 *                     sentAt: "2025-11-29T10:05:15Z"
 *                     toFrom: false
 *                     sender: "ai"
 *                     index: 2
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with this id does not exist"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/ai/send-message:
 *   post:
 *     summary: Send a message to the AI
 *     description: Sends a user message to the AI assistant and receives a response. The AI has access to the user's complete up-to-date health data including all nutrition logs, activity logs, sleep logs, and nutrition goals. The context is automatically refreshed before each message to include any new or updated logs.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message content to send to the AI
 *                 example: "How am I doing with my protein intake this week?"
 *     responses:
 *       200:
 *         description: Message sent successfully and AI response received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Message sent successfully"
 *                 userMessage:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier of the user message
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the user
 *                     systemPromptId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the system prompt used
 *                     message:
 *                       type: string
 *                       description: Content of the user message
 *                     sentAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp when message was sent
 *                     toFrom:
 *                       type: boolean
 *                       example: true
 *                       description: Always true for user messages
 *                     index:
 *                       type: integer
 *                       description: Sequential position in conversation
 *                 aiResponse:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier of the AI response
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the user
 *                     systemPromptId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the system prompt used
 *                     message:
 *                       type: string
 *                       description: Content of the AI response with analysis
 *                     sentAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp when response was generated
 *                     toFrom:
 *                       type: boolean
 *                       example: false
 *                       description: Always false for AI messages
 *                     index:
 *                       type: integer
 *                       description: Sequential position in conversation
 *             example:
 *               message: "Message sent successfully"
 *               userMessage:
 *                 id: "123e4567-e89b-12d3-a456-426614174003"
 *                 userId: "987e6543-e21b-12d3-a456-426614174000"
 *                 systemPromptId: "456e7890-e89b-12d3-a456-426614174000"
 *                 message: "How am I doing with my protein intake this week?"
 *                 sentAt: "2025-11-29T10:15:00Z"
 *                 toFrom: true
 *                 index: 3
 *               aiResponse:
 *                 id: "789e1234-e89b-12d3-a456-426614174004"
 *                 userId: "987e6543-e21b-12d3-a456-426614174000"
 *                 systemPromptId: "456e7890-e89b-12d3-a456-426614174000"
 *                 message: "Based on your latest nutrition logs, your protein intake this week has been excellent! You've consistently hit 85-95% of your daily protein goal of 150g..."
 *                 sentAt: "2025-11-29T10:15:05Z"
 *                 toFrom: false
 *                 index: 4
 *       400:
 *         description: Missing required message field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: message or conversationId"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: No active conversation found for user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No active conversation found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

export default router;
