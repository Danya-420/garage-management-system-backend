import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return; 
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (req as any).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return; 
  }
};

export {};