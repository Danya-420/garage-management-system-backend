import { Request, Response } from 'express';
import { RegisteredUserService } from '../services/registeredUser.service';

const registeredUserService = new RegisteredUserService();

export const createRegisteredUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { membershipId, paymentBalance, notificationSettings } = req.body;
    if (!membershipId || paymentBalance === undefined || notificationSettings === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await registeredUserService.createRegisteredUser(userId, membershipId, paymentBalance, notificationSettings);
    res.status(201).json({ message: 'Registered user created successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to create registered user' });
  }
};

export const getRegisteredUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const user = await registeredUserService.getRegisteredUser(userId);
    if (!user) return res.status(404).json({ message: 'Registered user not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to retrieve registered user' });
  }
};

export const updateRegisteredUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { membershipId, paymentBalance, notificationSettings } = req.body;
    if (!membershipId || paymentBalance === undefined || notificationSettings === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await registeredUserService.updateRegisteredUser(userId, membershipId, paymentBalance, notificationSettings);
    res.status(200).json({ message: 'Registered user updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update registered user' });
  }
};

export const deleteRegisteredUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    await registeredUserService.deleteRegisteredUser(userId);
    res.status(200).json({ message: 'Registered user deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to delete registered user' });
  }
};