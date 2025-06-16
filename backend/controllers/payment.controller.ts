// src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import { PaymentService, PaymentServiceRequest, Payment, PaymentHistory } from '../services/payment.service';

const paymentService = new PaymentService();

export const createPaymentService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { supportedPaymentMethods, transactionFees, paymentProviders, isActive } = req.body;
    const request: PaymentServiceRequest = { supportedPaymentMethods, transactionFees, paymentProviders, isActive };
    await paymentService.createPaymentService(userId, request);
    res.json({ message: 'Payment service created successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to create payment service' });
  }
};

export const getPaymentService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const service = await paymentService.getPaymentService(userId);
    if (!service) return res.status(404).json({ message: 'Payment service not found' });
    res.json(service);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to retrieve payment service' });
  }
};

export const updatePaymentService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { supportedPaymentMethods, transactionFees, paymentProviders, isActive } = req.body;
    const request: PaymentServiceRequest = { supportedPaymentMethods, transactionFees, paymentProviders, isActive };
    await paymentService.updatePaymentService(userId, request);
    res.json({ message: 'Payment service updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update payment service' });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { untilId, paymentServiceId, amount, transactionFees, description, status } = req.body;
    if (!untilId || !paymentServiceId || !amount || !description || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await paymentService.createPayment(userId, untilId, paymentServiceId, amount, transactionFees, description, status);
    res.json({ message: 'Payment created successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to create payment' });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const payments = await paymentService.getPayments(userId);
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to retrieve payments' });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { paymentId, status } = req.body;
    if (!paymentId || !status) return res.status(400).json({ message: 'Payment ID and status are required' });
    await paymentService.updatePaymentStatus(paymentId, status);
    res.json({ message: 'Payment status updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update payment status' });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const history = await paymentService.getPaymentHistory(userId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to retrieve payment history' });
  }
};

export const addPaymentToHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { paymentId, transactionDate, paymentMethod, status } = req.body;
    if (!paymentId) return res.status(400).json({ message: 'Payment ID is required' });
    await paymentService.addPaymentToHistory(paymentId, transactionDate, paymentMethod, status);
    res.json({ message: 'Payment added to history successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to add payment to history' });
  }
};