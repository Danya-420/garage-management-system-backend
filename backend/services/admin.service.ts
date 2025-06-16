// src/services/administrator.service.ts
import { connectToDb } from '../config/db';
import sql from 'mssql';
import { Administrator } from '../models/admin.model';

export class AdministratorService {
  private async getConnection(): Promise<any> {
    const pool = await connectToDb();
    return pool;
  }

  public async createAdministrator(userId: number, adminLevel: number, accessRights: string, systemPermissions: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('adminLevel', sql.Int, adminLevel);
      request.input('accessRights', sql.NVarChar(sql.MAX), accessRights);
      request.input('systemPermissions', sql.NVarChar(sql.MAX), systemPermissions);

      await request.query(`
        INSERT INTO dbo.Administrator (userId, adminLevel, accessRights, systemPermissions)
        VALUES (@userId, @adminLevel, @accessRights, @systemPermissions)
      `);
      return true;
    } catch (error) {
      console.error('Error creating administrator:', error);
      throw new Error('Failed to create administrator');
    } finally {
      pool.close();
    }
  }

  public async getAdministrator(userId: number): Promise<Administrator | null> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`
        SELECT userId, adminLevel, accessRights, systemPermissions
        FROM dbo.Administrator
        WHERE userId = @userId
      `);
      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          userId: record.userId,
          adminLevel: record.adminLevel,
          accessRights: record.accessRights,
          systemPermissions: record.systemPermissions
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching administrator:', error);
      throw new Error('Failed to retrieve administrator');
    } finally {
      pool.close();
    }
  }

  public async updateAdministrator(userId: number, adminLevel: number, accessRights: string, systemPermissions: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('adminLevel', sql.Int, adminLevel);
      request.input('accessRights', sql.NVarChar(sql.MAX), accessRights);
      request.input('systemPermissions', sql.NVarChar(sql.MAX), systemPermissions);

      await request.query(`
        UPDATE dbo.Administrator
        SET adminLevel = @adminLevel,
            accessRights = @accessRights,
            systemPermissions = @systemPermissions
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error updating administrator:', error);
      throw new Error('Failed to update administrator');
    } finally {
      pool.close();
    }
  }

  public async deleteAdministrator(userId: number): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);

      await request.query(`
        DELETE FROM dbo.Administrator
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error deleting administrator:', error);
      throw new Error('Failed to delete administrator');
    } finally {
      pool.close();
    }
  }
}