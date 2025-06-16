// src/routes/feedback.routes.ts
import express, { Request, Response, NextFunction } from 'express';
import {
  createFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback
} from '../controllers/feedback.controller';
import { verifyToken } from '../middleware/auth.middleware'; // Імпорт існуючого middleware

const router = express.Router();

// Створення зворотного зв’язку (потрібна авторизація)
router.post('/feedback', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createFeedback(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

// Отримання зворотного зв’язку (потрібна авторизація)
router.get('/feedback', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getFeedback(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

// Оновлення зворотного зв’язку (потрібна авторизація)
router.put('/feedback', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateFeedback(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

// Видалення зворотного зв’язку (потрібна авторизація)
router.delete('/feedback', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteFeedback(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

export default router;