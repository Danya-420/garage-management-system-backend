import { Request, Response } from 'express';
import { ManagerService } from '../services/manager.service';

const managerService = new ManagerService();

export const createManager = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { managementPermissions, reportingAccess } = req.body;
    if (!managementPermissions || !reportingAccess) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await managerService.createManager(userId, managementPermissions, reportingAccess);
    res.status(201).json({ message: 'Manager created successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to create manager' });
  }
};

export const getManager = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const manager = await managerService.getManager(userId);
    if (!manager) return res.status(404).json({ message: 'Manager not found' });
    res.json(manager);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to retrieve manager' });
  }
};

export const updateManager = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { managementPermissions, reportingAccess } = req.body;
    if (!managementPermissions || !reportingAccess) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await managerService.updateManager(userId, managementPermissions, reportingAccess);
    res.status(200).json({ message: 'Manager updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update manager' });
  }
};

export const deleteManager = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    await managerService.deleteManager(userId);
    res.status(200).json({ message: 'Manager deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to delete manager' });
  }
};