import { users } from '../../../database/schema/users.schema';

/**
 * @swagger
 * components:
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
 *         is_premium:
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
 */
export type User = typeof users.$inferSelect;
export type UserWithPremium = User & { is_premium: boolean };
export type UpdateUserDto = Partial<
  Omit<User, 'id' | 'email' | 'password' | 'role' | 'isEmailVerified' | 'createdAt'>
>;
