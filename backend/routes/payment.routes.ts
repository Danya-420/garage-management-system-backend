// src/routes/payment.routes.ts
import express, { Request, Response, NextFunction } from 'express';
import {
  createPaymentService,
  getPaymentService,
  updatePaymentService,
  createPayment,
  getPayments,
  updatePaymentStatus,
  getPaymentHistory,
  addPaymentToHistory
} from '../controllers/payment.controller';
import { checkRole } from '../middleware/role.middleware';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/payment-service', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createPaymentService(req, res);
    res.status(201).json({ message: 'Payment service created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.get('/payment-service', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getPaymentService(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.put('/payment-service', [verifyToken, checkRole('admin')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updatePaymentService(req, res);
    res.status(200).json({ message: 'Payment service updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.post('/payment', [verifyToken, checkRole('user')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createPayment(req, res);
    res.status(201).json({ message: 'Payment created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.get('/payments', [verifyToken, checkRole('user')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getPayments(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.put('/payment-status', [verifyToken, checkRole('manager')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updatePaymentStatus(req, res);
    res.status(200).json({ message: 'Payment status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.get('/payment-history', [verifyToken, checkRole('user')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getPaymentHistory(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

router.post('/payment-history', [verifyToken, checkRole('user')], async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addPaymentToHistory(req, res);
    res.status(201).json({ message: 'Payment added to history successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    next(error);
  }
});

export default router;