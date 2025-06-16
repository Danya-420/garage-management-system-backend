// src/controllers/userRepository.controller.ts
import { Request, Response } from 'express';
import { UserRepositoryService, UserRepositoryRequest } from '../services/userRepository.service';

const userRepositoryService = new UserRepositoryService();

export const createUserRepository = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number; // Отримання userId з токена
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { userRepositoryId, connectionSettings, cacheConfiguration, queryOptimizations, dataScheme, adminId, managerId } = req.body;
    if (!userRepositoryId) return res.status(400).json({ message: 'userRepositoryId is required' });
    if (!connectionSettings || !dataScheme) return res.status(400).json({ message: 'connectionSettings and dataScheme are required' });

    const request: UserRepositoryRequest = { connectionSettings, cacheConfiguration, queryOptimizations, dataScheme, adminId, managerId };
    await userRepositoryService.createUserRepository(userRepositoryId, request);
    res.status(201).json({ message: 'User repository created successfully', userRepositoryId });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to create user repository' });
  }
};

export const getUserRepository = async (req: Request, res: Response) => {
  try {
    const { userRepositoryId } = req.params;
    if (!userRepositoryId) return res.status(400).json({ message: 'userRepositoryId is required' });
    const repository = await userRepositoryService.getUserRepository(parseInt(userRepositoryId));
    if (!repository) return res.status(404).json({ message: 'User repository not found' });
    res.json(repository); // Повертаємо об’єкт замість повідомлення
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to retrieve user repository' });
  }
};

export const updateUserRepository = async (req: Request, res: Response) => {
  try {
    const { userRepositoryId } = req.params;
    if (!userRepositoryId) return res.status(400).json({ message: 'userRepositoryId is required' });

    const { connectionSettings, cacheConfiguration, queryOptimizations, dataScheme, adminId, managerId } = req.body;
    const request: UserRepositoryRequest = { connectionSettings, cacheConfiguration, queryOptimizations, dataScheme, adminId, managerId };
    await userRepositoryService.updateUserRepository(parseInt(userRepositoryId), request);
    res.json({ message: 'User repository updated successfully', userRepositoryId });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update user repository' });
  }
};

export const deleteUserRepository = async (req: Request, res: Response) => {
  try {
    const { userRepositoryId } = req.params;
    if (!userRepositoryId) return res.status(400).json({ message: 'userRepositoryId is required' });
    await userRepositoryService.deleteUserRepository(parseInt(userRepositoryId));
    res.json({ message: 'User repository deleted successfully', userRepositoryId });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to delete user repository' });
  }
};