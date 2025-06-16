// src/routes/registeredUser.routes.ts
import express, { Request, Response, NextFunction } from 'express';
import {
  createRegisteredUser,
  getRegisteredUser,
  updateRegisteredUser,
  deleteRegisteredUser
} from '../controllers/registeredUser.controller';
import { verifyToken } from '../middleware/auth.middleware';
import {  checkRole } from '../middleware/role.middleware';

const router = express.Router();

// Створення зареєстрованого користувача (доступ для всіх)
router.post('/registered-user', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createRegisteredUser(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

// Отримання даних зареєстрованого користувача (доступ для всіх)
router.get('/registered-user', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getRegisteredUser(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

// Оновлення даних зареєстрованого користувача (доступ для всіх)
router.put('/registered-user', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateRegisteredUser(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

// Видалення зареєстрованого користувача (доступ для всіх)
router.delete('/registered-user', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteRegisteredUser(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

export default router;