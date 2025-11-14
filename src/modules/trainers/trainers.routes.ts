import { Router } from 'express';
import {
  createTrainerProfile,
  updateTrainerProfile,
  getMyTrainerProfile,
  getTrainerProfile,
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
 *         position:
 *           type: string
 *         company:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         description:
 *           type: string
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
 *         specialization:
 *           type: string
 *         about:
 *           type: string
 *         achievements:
 *           type: string
 *         consultationPrice:
 *           type: number
 *         trainingPrice:
 *           type: number
 *         isActive:
 *           type: boolean
 *     CreateTrainerProfileDto:
 *       type: object
 *       properties:
 *         specialization:
 *           type: string
 *         about:
 *           type: string
 *         achievements:
 *           type: string
 *         consultationPrice:
 *           type: number
 *         trainingPrice:
 *           type: number
 *         experience:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TrainerExperience'
 *     UpdateTrainerProfileDto:
 *       type: object
 *       properties:
 *         specialization:
 *           type: string
 *         about:
 *           type: string
 *         achievements:
 *           type: string
 *         consultationPrice:
 *           type: number
 *         trainingPrice:
 *           type: number
 *         isActive:
 *           type: boolean
 *         experience:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TrainerExperience'
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

export default router;
