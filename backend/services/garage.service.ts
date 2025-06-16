// src/services/garage.service.ts
import { connectToDb } from '../config/db';
import sql from 'mssql';
import { UserRepositoryService } from '../services/userRepository.service'; // Імпорт класу сервісу
import { GarageUnit } from '../models/garage.model';

export class GarageUnitService {
  private userRepositoryService: UserRepositoryService;

  constructor() {
    this.userRepositoryService = new UserRepositoryService(); // Створюємо екземпляр сервісу
  }

  public async assignToUser(unitId: number, userId: number): Promise<boolean> {
    const pool = await connectToDb();
    try {
      const request = pool.request();
      request.input('unitId', sql.Int, unitId);
      request.input('userId', sql.Int, userId);

      // Перевіряємо користувача через userId (додаємо логіку пошуку)
      const userRepo = await this.userRepositoryService.findByUserId(userId); // Використовуємо findByUserId
      if (!userRepo) throw new Error('User not found');

      await request.query(`
        UPDATE dbo.GarageUnit 
        SET ownerId = @userId, status = 'Assigned'
        WHERE unitId = @unitId AND status = 'Available'
      `);

      const result = await request.query(`
        SELECT ownerId FROM dbo.GarageUnit WHERE unitId = @unitId
      `);
      return result.recordset[0]?.ownerId === userId;
    } finally {
      pool.close();
    }
  }

  public async updateAccessRights(unitId: number, userId: number, accessRights: string): Promise<boolean> {
    const pool = await connectToDb();
    try {
      const request = pool.request();
      request.input('unitId', sql.Int, unitId);
      request.input('userId', sql.Int, userId);

      // Перевіряємо, чи користувач є менеджером або власником гаража
      const isManager = await this.userRepositoryService.isManager(userId); // Додаємо isManager
      const unit = await this.getUnitProperties(unitId);
      if (!isManager && unit?.ownerId !== userId) {
        throw new Error('Unauthorized');
      }

      request.input('accessRights', sql.NVarChar, accessRights);
      await request.query(`
        UPDATE dbo.GarageUnit 
        SET accessSettings = @accessRights
        WHERE unitId = @unitId
      `);
      return true;
    } finally {
      pool.close();
    }
  }

  public async getUnitProperties(unitId: number): Promise<GarageUnit | null> {
    const pool = await connectToDb();
    try {
      const request = pool.request();
      request.input('unitId', sql.Int, unitId);
      const result = await request.query(`
        SELECT unitId, location, status, ownerId, accessSettings, garageNumber, size, utilityData 
        FROM dbo.GarageUnit WHERE unitId = @unitId
      `);
      return result.recordset[0] || null;
    } finally {
      pool.close();
    }
  }

  public async updateUnitStatus(unitId: number, status: string): Promise<boolean> {
    const pool = await connectToDb();
    try {
      const request = pool.request();
      request.input('unitId', sql.Int, unitId);
      request.input('status', sql.NVarChar, status);
      await request.query(`
        UPDATE dbo.GarageUnit 
        SET status = @status 
        WHERE unitId = @unitId
      `);
      return true;
    } finally {
      pool.close();
    }
  }
}


