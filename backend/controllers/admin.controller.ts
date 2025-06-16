import { Request, Response } from 'express';
import { AdministratorService } from '../services/admin.service';

const administratorService = new AdministratorService();

export const createAdministrator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { adminLevel, accessRights, systemPermissions } = req.body;
    if (!adminLevel || !accessRights || !systemPermissions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await administratorService.createAdministrator(userId, adminLevel, accessRights, systemPermissions);
    res.status(201).json({ message: 'Administrator created successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to create administrator' });
  }
};

export const getAdministrator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const admin = await administratorService.getAdministrator(userId);
    if (!admin) return res.status(404).json({ message: 'Administrator not found' });
    res.json(admin);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to retrieve administrator' });
  }
};

export const updateAdministrator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { adminLevel, accessRights, systemPermissions } = req.body;
    if (!adminLevel || !accessRights || !systemPermissions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await administratorService.updateAdministrator(userId, adminLevel, accessRights, systemPermissions);
    res.status(200).json({ message: 'Administrator updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update administrator' });
  }
};

export const deleteAdministrator = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    await administratorService.deleteAdministrator(userId);
    res.status(200).json({ message: 'Administrator deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to delete administrator' });
  }
};