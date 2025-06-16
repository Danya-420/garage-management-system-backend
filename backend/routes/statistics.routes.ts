// src/routes/statistics.routes.ts
import express, { Request, Response, NextFunction } from 'express';
import {
  createStatisticsService,
  getStatisticsService,
  updateStatisticsService,
  deleteStatisticsService
} from '../controllers/statistics.controller';
import { checkRole } from '../middleware/role.middleware';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/statistics-service', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createStatisticsService(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.get('/statistics-service/:statisticsServiceId', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getStatisticsService(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.put('/statistics-service/:statisticsServiceId', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateStatisticsService(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.delete('/statistics-service/:statisticsServiceId', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteStatisticsService(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

export default router;