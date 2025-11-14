import { Router } from 'express';
import {
  createTrainerProfile,
  updateTrainerProfile,
  getMyTrainerProfile,
  getTrainerProfile,
  addTrainerExperience,
  updateTrainerExperience,
  deleteTrainerExperience,
} from './trainers.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TrainerExperience:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         trainerId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     CreateTrainerExperienceDto:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     UpdateTrainerExperienceDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     Trainer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         bio:
 *           type: string
 *         certification:
 *           type: string
 *         specialization:
 *           type: string
 *         location:
 *           type: string
 *         isActive:
 *           type: boolean
 *     CreateTrainerProfileDto:
 *       type: object
 *       properties:
 *         bio:
 *           type: string
 *         certification:
 *           type: string
 *         specialization:
 *           type: string
 *         location:
 *           type: string
 *         experience:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreateTrainerExperienceDto'
 *     UpdateTrainerProfileDto:
 *       type: object
 *       properties:
 *         bio:
 *           type: string
 *         certification:
 *           type: string
 *         specialization:
 *           type: string
 *         location:
 *           type: string
 *         isActive:
 *           type: boolean
 *     FullTrainerProfile:
 *       allOf:
 *         - $ref: '#/components/schemas/Trainer'
 *         - type: object
 *           properties:
 *             experience:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TrainerExperience'
 */

/**
 * @swagger
 * /trainers:
 *   post:
 *     summary: Create a new trainer profile
 *     description: Creates a new trainer profile for the authenticated user
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTrainerProfileDto'
 *     responses:
 *       201:
 *         description: Trainer profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trainer profile created successfully
 *                 trainer:
 *                   $ref: '#/components/schemas/Trainer'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware, createTrainerProfile);

/**
 * @swagger
 * /trainers/me:
 *   put:
 *     summary: Update trainer profile
 *     description: Updates the trainer profile of the authenticated user
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTrainerProfileDto'
 *     responses:
 *       200:
 *         description: Trainer profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trainer profile updated successfully
 *                 trainer:
 *                   $ref: '#/components/schemas/Trainer'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/me', authMiddleware, updateTrainerProfile);

/**
 * @swagger
 * /trainers/me:
 *   get:
 *     summary: Get my trainer profile
 *     description: Returns the trainer profile of the authenticated user
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trainer profile fetched successfully
 *                 trainer:
 *                   $ref: '#/components/schemas/FullTrainerProfile'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Trainer profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Trainer profile not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/me', authMiddleware, getMyTrainerProfile);

/**
 * @swagger
 * /trainers/{id}:
 *   get:
 *     summary: Get trainer profile by ID
 *     description: Returns the full profile of a trainer by their ID
 *     tags:
 *       - Trainers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trainer profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trainer profile fetched successfully
 *                 trainer:
 *                   $ref: '#/components/schemas/FullTrainerProfile'
 *       404:
 *         description: Trainer profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Trainer profile not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', getTrainerProfile);

/**
 * @swagger
 * /trainers/me/experience:
 *   post:
 *     summary: Add experience to trainer profile
 *     description: Adds a new experience to the trainer profile of the authenticated user
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTrainerExperienceDto'
 *     responses:
 *       201:
 *         description: Trainer experience added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trainer experience added successfully
 *                 experience:
 *                   $ref: '#/components/schemas/TrainerExperience'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/me/experience', authMiddleware, addTrainerExperience);

/**
 * @swagger
 * /trainers/me/experience/{experienceId}:
 *   put:
 *     summary: Update trainer experience
 *     description: Updates an existing experience for the authenticated user's trainer profile
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTrainerExperienceDto'
 *     responses:
 *       200:
 *         description: Trainer experience updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trainer experience updated successfully
 *                 experience:
 *                   $ref: '#/components/schemas/TrainerExperience'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Trainer experience not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/me/experience/:experienceId', authMiddleware, updateTrainerExperience);

/**
 * @swagger
 * /trainers/me/experience/{experienceId}:
 *   delete:
 *     summary: Delete trainer experience
 *     description: Deletes an existing experience from the authenticated user's trainer profile
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trainer experience deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trainer experience deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Trainer experience not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/me/experience/:experienceId', authMiddleware, deleteTrainerExperience);

export default router;
