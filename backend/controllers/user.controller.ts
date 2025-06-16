
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const getAllUsers = async (req: Request, res: Response): Promise<void> => { 
    try {
        const { search, role, page, limit } = req.query;

        const queryParams = {
            search: search ? String(search) : undefined,
            role: role ? String(role) as 'Default member' | 'Manager' | 'Admin' : undefined,
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
        };

        const result = await userService.getAllUsers(queryParams);
        res.status(200).json(result);
        return; 
    } catch (error: any) {
        console.error('Error in getAllUsers controller:', error);
        res.status(500).json({ message: error.message || 'Failed to retrieve users' });
        return; 
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => { 
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid User ID' });
            return; 
        }

        const user = await userService.getUserById(userId);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
        return; 
    } catch (error: any) {
        console.error('Error in getUserById controller:', error);
        res.status(500).json({ message: error.message || 'Failed to retrieve user' });
        return; 
    }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => { 
    try {
        const userId = parseInt(req.params.id);
        const { newRole } = req.body;

        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid User ID' });
            return; 
        }

        const allowedRoles = ['Default member', 'Manager', 'Admin'];
        if (!allowedRoles.includes(newRole)) {
            res.status(400).json({ message: 'Invalid new role specified' });
            return; 
        }

        const result = await userService.updateUserRole(userId, newRole);
        res.status(200).json(result);
        return; 
    } catch (error: any) {
        console.error('Error in updateUserRole controller:', error);
        res.status(500).json({ message: error.message || 'Failed to update user role' });
        return; 
    }
};