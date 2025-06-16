import { Request, Response, NextFunction } from 'express';
import { ManagerService } from '../services/manager.service'; // Імпорт ManagerService
import { AdministratorService } from '../services/admin.service'; // Імпорт AdministratorService

export const checkRole = (requiredRole: 'user' | 'manager' | 'admin') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId as number;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const managerService = new ManagerService();
      const adminService = new AdministratorService();

      const isManager = await managerService.getManager(userId);
      const isAdmin = await adminService.getAdministrator(userId);

      if (requiredRole === 'admin' && !isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      if (requiredRole === 'manager' && !isManager && !isAdmin) {
        return res.status(403).json({ message: 'Manager access required' });
      }
      // Для 'user' доступ надається за замовчуванням, якщо не менеджер/адмін

      next();
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
      next(error);
    }
  };
};