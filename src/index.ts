import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';
import cookieParser from 'cookie-parser';
import usersRoutes from './modules/users/users.routes';
import authRoutes from './modules/auth/auth.routes';
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

app.get('/', (req, res) => {
  res.send('API server is running');
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code, role } = req.query;
  if (!code) {
    return res.status(400).send('No code provided');
  }
  if (!role) {
    return res.status(400).send('No role provided');
  }
  try {
    const codeStr = typeof code === 'object' ? JSON.stringify(code) : String(code);
    const roleStr = typeof role === 'object' ? JSON.stringify(role) : String(role);
    const result = await googleAuth({ code: codeStr, role: roleStr });
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
      googleUser: result.googleUser,
    });
  } catch (error: any) {
    res.status(400).json({
      error: 'Google auth failed',
      details: error.response?.data || error.message,
    });
  }
});

export default app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
