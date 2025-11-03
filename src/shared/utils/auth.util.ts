import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const generateVerificationCode = (): string => {
  const randomNumber = crypto.randomInt(1000, 10000);
  return randomNumber.toString();
};
