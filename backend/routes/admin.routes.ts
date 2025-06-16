// src/routes/administrator.routes.ts
import express, { Request, Response, NextFunction } from 'express';
import { createAdministrator, getAdministrator, updateAdministrator, deleteAdministrator } from '../controllers/admin.controller';
import { checkRole } from '../middleware/role.middleware';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/administrator', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createAdministrator(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.get('/administrator', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAdministrator(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.put('/administrator', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateAdministrator(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.delete('/administrator', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteAdministrator(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

export default router;