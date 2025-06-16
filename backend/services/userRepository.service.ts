// src/services/userRepository.service.ts
import { connectToDb } from '../config/db';
import sql from 'mssql';

export interface UserRepositoryRequest {
  userRepositoryId?: number;
  connectionSettings?: string;
  cacheConfiguration?: string;
  queryOptimizations?: string;
  dataScheme?: string;
  adminId?: number;
  managerId?: number;
}

export interface UserRepository {
  userRepositoryId: number;
  connectionSettings: string;
  cacheConfiguration: string | null;
  queryOptimizations: string | null;
  dataScheme: string;
  adminId: number | null;
  managerId: number | null;
}

export class UserRepositoryService {
  private async getConnection(): Promise<any> {
    const pool = await connectToDb();
    return pool;
  }

  public async createUserRepository(userRepositoryId: number, request: UserRepositoryRequest): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const requestDb = pool.request();
      requestDb.input('userRepositoryId', sql.Int, userRepositoryId);
      requestDb.input('connectionSettings', sql.NVarChar(255), request.connectionSettings || '');
      requestDb.input('cacheConfiguration', sql.NVarChar(255), request.cacheConfiguration || null);
      requestDb.input('queryOptimizations', sql.NVarChar(255), request.queryOptimizations || null);
      requestDb.input('dataScheme', sql.NVarChar(255), request.dataScheme || '');
      requestDb.input('adminId', sql.Int, request.adminId || null);
      requestDb.input('managerId', sql.Int, request.managerId || null);

      await requestDb.query(`
        INSERT INTO dbo.UserRepository (userRepositoryId, connectionSettings, cacheConfiguration, queryOptimizations, dataScheme, adminId, managerId)
        VALUES (@userRepositoryId, @connectionSettings, @cacheConfiguration, @queryOptimizations, @dataScheme, @adminId, @managerId)
      `);
      return true;
    } catch (error) {
      console.error('Error creating user repository:', error);
      throw new Error('Failed to create user repository');
    } finally {
      pool.close();
    }
  }

  public async getUserRepository(userRepositoryId: number): Promise<UserRepository | null> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userRepositoryId', sql.Int, userRepositoryId);
      const result = await request.query(`
        SELECT userRepositoryId, connectionSettings, cacheConfiguration, queryOptimizations, dataScheme, adminId, managerId
        FROM dbo.UserRepository
        WHERE userRepositoryId = @userRepositoryId
      `);
      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          userRepositoryId: record.userRepositoryId,
          connectionSettings: record.connectionSettings,
          cacheConfiguration: record.cacheConfiguration,
          queryOptimizations: record.queryOptimizations,
          dataScheme: record.dataScheme,
          adminId: record.adminId,
          managerId: record.managerId
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user repository:', error);
      throw new Error('Failed to retrieve user repository');
    } finally {
      pool.close();
    }
  }

  public async findByUserId(userId: number): Promise<UserRepository | null> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`
        SELECT userRepositoryId, connectionSettings, cacheConfiguration, queryOptimizations, dataScheme, adminId, managerId
        FROM dbo.UserRepository
        WHERE adminId = @userId OR managerId = @userId
      `);
      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          userRepositoryId: record.userRepositoryId,
          connectionSettings: record.connectionSettings,
          cacheConfiguration: record.cacheConfiguration,
          queryOptimizations: record.queryOptimizations,
          dataScheme: record.dataScheme,
          adminId: record.adminId,
          managerId: record.managerId
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user repository by userId:', error);
      throw new Error('Failed to retrieve user repository by userId');
    } finally {
      pool.close();
    }
  }

  public async isManager(userId: number): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`
        SELECT COUNT(*) as count
        FROM dbo.UserRepository
        WHERE managerId = @userId
      `);
      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error checking manager status:', error);
      throw new Error('Failed to check manager status');
    } finally {
      pool.close();
    }
  }

  public async updateUserRepository(userRepositoryId: number, request: UserRepositoryRequest): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const requestDb = pool.request();
      requestDb.input('userRepositoryId', sql.Int, userRepositoryId);
      requestDb.input('connectionSettings', sql.NVarChar(255), request.connectionSettings || '');
      requestDb.input('cacheConfiguration', sql.NVarChar(255), request.cacheConfiguration || null);
      requestDb.input('queryOptimizations', sql.NVarChar(255), request.queryOptimizations || null);
      requestDb.input('dataScheme', sql.NVarChar(255), request.dataScheme || '');
      requestDb.input('adminId', sql.Int, request.adminId || null);
      requestDb.input('managerId', sql.Int, request.managerId || null);

      await requestDb.query(`
        UPDATE dbo.UserRepository
        SET connectionSettings = @connectionSettings,
            cacheConfiguration = @cacheConfiguration,
            queryOptimizations = @queryOptimizations,
            dataScheme = @dataScheme,
            adminId = @adminId,
            managerId = @managerId
        WHERE userRepositoryId = @userRepositoryId
      `);
      return true;
    } catch (error) {
      console.error('Error updating user repository:', error);
      throw new Error('Failed to update user repository');
    } finally {
      pool.close();
    }
  }

  public async deleteUserRepository(userRepositoryId: number): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userRepositoryId', sql.Int, userRepositoryId);

      await request.query(`
        DELETE FROM dbo.UserRepository
        WHERE userRepositoryId = @userRepositoryId
      `);
      return true;
    } catch (error) {
      console.error('Error deleting user repository:', error);
      throw new Error('Failed to delete user repository');
    } finally {
      pool.close();
    }
  }
}