import { Router } from 'express';
import {
  createActivityLogHandler,
  deleteActivityLogHandler,
  getActivityLogsByPeriodHandler,
  getActivityLogsHandler,
  updateActivityLogHandler,
} from './activity-logs.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: Get all activity logs for the current user
 *     description: Returns all activity logs for the user associated with the provided access token
 *     tags:
 *       - Activity Logs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity logs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       activityType:
 *                         type: string
 *                       intensity:
 *                         type: string
 *                       durationMinutes:
 *                         type: number
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authMiddleware, getActivityLogsHandler);

/**
 * @swagger
 * /activity-logs/period:
 *   get:
 *     summary: Get activity logs for a 30-day period
 *     description: Returns activity logs for the user for a 30-day period ending on the specified date.
 *     tags:
 *       - Activity Logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *             - type: number
 *               description: 'Timestamp in milliseconds'
 *         description: The end date of the 30-day period. Can be a date-time string or a timestamp.
 *     responses:
 *       200:
 *         description: Activity logs fetched successfully for the period
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Activity logs fetched successfully for the period
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       activityType:
 *                         type: string
 *                       intensity:
 *                         type: string
 *                       durationMinutes:
 *                         type: number
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/period', authMiddleware, getActivityLogsByPeriodHandler);

/**
 * @swagger
 * /activity-logs:
 *   post:
 *     summary: Create a new activity log
 *     description: Creates a new activity log for the user associated with the provided access token
 *     tags:
 *       - Activity Logs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityType
 *               - intensity
 *               - durationMinutes
 *               - completedAt
 *             properties:
 *               activityType:
 *                 type: string
 *               intensity:
 *                 type: string
 *               durationMinutes:
 *                 type: number
 *               completedAt:
 *                 oneOf:
 *                   - type: string
 *                     format: date-time
 *                   - type: number
 *                     description: 'Timestamp in milliseconds'
 *     responses:
 *       201:
 *         description: Activity log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 log:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     activityType:
 *                       type: string
 *                     intensity:
 *                       type: string
 *                     durationMinutes:
 *                       type: number
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware, createActivityLogHandler);

/**
 * @swagger
 * /activity-logs/{id}:
 *   patch:
 *     summary: Update an activity log
 *     description: Updates an activity log for the user associated with the provided access token
 *     tags:
 *       - Activity Logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityType:
 *                 type: string
 *               intensity:
 *                 type: string
 *               durationMinutes:
 *                 type: number
 *               completedAt:
 *                 oneOf:
 *                   - type: string
 *                     format: date-time
 *                   - type: number
 *                     description: 'Timestamp in milliseconds'
 *     responses:
 *       200:
 *         description: Activity log updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Activity log updated successfully
 *                 log:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     activityType:
 *                       type: string
 *                     intensity:
 *                       type: string
 *                     durationMinutes:
 *                       type: number
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Activity log not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id', authMiddleware, updateActivityLogHandler);

/**
 * @swagger
 * /activity-logs/{id}:
 *   delete:
 *     summary: Delete an activity log
 *     description: Deletes an activity log for the user associated with the provided access token
 *     tags:
 *       - Activity Logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Activity log deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Activity log deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Activity log not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware, deleteActivityLogHandler);

export default router;
