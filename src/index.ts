import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';
import cookieParser from 'cookie-parser';
import usersRoutes from './modules/users/users.routes';
import authRoutes from './modules/auth/auth.routes';
import trainersRoutes from './modules/trainers/trainers.routes';
import nutritionLogsRoutes from './modules/nutrition-logs/nutrition-logs.routes';
import sleepLogsRoutes from './modules/sleep-logs/sleep-logs.routes';
import { googleAuth } from './modules/auth/auth.service';
import { sendVerificationEmail } from './modules/email/email.service';

console.log('Starting API server...');

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainersRoutes);
app.use('/api/nutrition-logs', nutritionLogsRoutes);
app.use('/api/sleep-logs', sleepLogsRoutes);

app.get('/', (_, res) => {
  res.send('API server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
