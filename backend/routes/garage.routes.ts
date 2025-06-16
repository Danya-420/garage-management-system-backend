import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  assignUnitToUser,
  updateAccessRights,
  getUnitProperties,
  updateUnitStatus
} from '../controllers/garage.controller';

const router = Router();

router.post('/assign', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assignUnitToUser(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.post('/access-rights', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateAccessRights(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.get('/properties/:unitId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUnitProperties(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.post('/status', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateUnitStatus(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

export default router;
