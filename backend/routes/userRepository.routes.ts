// src/routes/userRepository.routes.ts
import express, { Request, Response, NextFunction } from 'express';
import {
  createUserRepository,
  getUserRepository,
  updateUserRepository,
  deleteUserRepository
} from '../controllers/userRepository.controller';
import { verifyToken } from '../middleware/auth.middleware'; 
import {  checkRole } from '../middleware/role.middleware'; 

const router = express.Router();

// Створення UserRepository (тільки для адмінів)
router.post('/user-repository', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createUserRepository(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

// Отримання UserRepository (для всіх авторизованих)
router.get('/user-repository/:userRepositoryId', [verifyToken, checkRole('user')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserRepository(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

// Оновлення UserRepository (тільки для адмінів)
router.put('/user-repository/:userRepositoryId', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateUserRepository(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

// Видалення UserRepository (тільки для адмінів)
router.delete('/user-repository/:userRepositoryId', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteUserRepository(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

export default router;