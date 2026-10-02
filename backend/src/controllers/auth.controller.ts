import { Request, Response } from 'express';

export const register = async (req: Request, res: Response) => {
  res.status(201).json({ message: 'User registered' });
};

export const login = async (req: Request, res: Response) => {
  res.status(200).json({ token: 'dummy_token' });
};

export const getProfile = async (req: Request, res: Response) => {
  res.status(200).json({ user: { id: 1, email: 'test@test.com' } });
};
