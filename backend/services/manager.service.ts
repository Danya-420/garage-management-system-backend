import { connectToDb } from '../config/db';
import sql from 'mssql';
import { Manager } from '../models/manager.model';

export class ManagerService {
  private async getConnection(): Promise<any> {
    const pool = await connectToDb();
    return pool;
  }

  public async createManager(userId: number, managementPermissions: string, reportingAccess: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('managementPermissions', sql.NVarChar(sql.MAX), managementPermissions);
      request.input('reportingAccess', sql.NVarChar(sql.MAX), reportingAccess);

      await request.query(`
        INSERT INTO dbo.Manager (userId, managementPermissions, reportingAccess)
        VALUES (@userId, @managementPermissions, @reportingAccess)
      `);
      return true;
    } catch (error) {
      console.error('Error creating manager:', error);
      throw new Error('Failed to create manager');
    } finally {
      pool.close();
    }
  }

  public async getManager(userId: number): Promise<Manager | null> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`
        SELECT userId, managementPermissions, reportingAccess
        FROM dbo.Manager
        WHERE userId = @userId
      `);
      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          userId: record.userId,
          managementPermissions: record.managementPermissions,
          reportingAccess: record.reportingAccess
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching manager:', error);
      throw new Error('Failed to retrieve manager');
    } finally {
      pool.close();
    }
  }

  public async updateManager(userId: number, managementPermissions: string, reportingAccess: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('managementPermissions', sql.NVarChar(sql.MAX), managementPermissions);
      request.input('reportingAccess', sql.NVarChar(sql.MAX), reportingAccess);

      await request.query(`
        UPDATE dbo.Manager
        SET managementPermissions = @managementPermissions,
            reportingAccess = @reportingAccess
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error updating manager:', error);
      throw new Error('Failed to update manager');
    } finally {
      pool.close();
    }
  }

  public async deleteManager(userId: number): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);

      await request.query(`
        DELETE FROM dbo.Manager
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error deleting manager:', error);
      throw new Error('Failed to delete manager');
    } finally {
      pool.close();
    }
  }
}