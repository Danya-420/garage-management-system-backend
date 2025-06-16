// src/routes/manager.routes.ts
import express, { Request, Response, NextFunction } from 'express';
import { createManager, getManager, updateManager, deleteManager } from '../controllers/manager.controller';
import { checkRole } from '../middleware/role.middleware';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/manager', [verifyToken, checkRole('manager')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createManager(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.get('/manager', [verifyToken, checkRole('manager')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getManager(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.put('/manager', [verifyToken, checkRole('manager')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateManager(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.delete('/manager', [verifyToken, checkRole('manager')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteManager(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

export default router;