// src/services/statistics.service.ts
import { connectToDb } from '../config/db';
import sql from 'mssql';

export interface StatisticsRequest {
  statisticsServiceId?: number;
  reportTypes?: string[];
  dataPoints?: string;
  visualizationMethods?: string[];
  userRepositoryId?: number;
}

export interface Statistics {
  statisticsServiceId: number;
  reportTypes: string[];
  dataPoints: string;
  visualizationMethods: string[];
  userRepositoryId: number;
}

export class StatisticsService {
  private async getConnection(): Promise<any> {
    const pool = await connectToDb();
    return pool;
  }

  public async createStatisticsService(statisticsServiceId: number, request: StatisticsRequest): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const requestDb = pool.request();
      requestDb.input('statisticsServiceId', sql.Int, statisticsServiceId);
      requestDb.input('reportTypes', sql.NVarChar, JSON.stringify(request.reportTypes || []));
      requestDb.input('dataPoints', sql.NVarChar(255), request.dataPoints || '');
      requestDb.input('visualizationMethods', sql.NVarChar, JSON.stringify(request.visualizationMethods || []));
      requestDb.input('userRepositoryId', sql.Int, request.userRepositoryId || null);

      await requestDb.query(`
        INSERT INTO dbo.StatisticsService (statisticsServiceId, reportTypes, dataPoints, visualizationMethods, userRepositoryId)
        VALUES (@statisticsServiceId, @reportTypes, @dataPoints, @visualizationMethods, @userRepositoryId)
      `);
      return true;
    } catch (error) {
      console.error('Error creating statistics service:', error);
      throw new Error('Failed to create statistics service');
    } finally {
      pool.close();
    }
  }

  public async getStatisticsService(statisticsServiceId: number): Promise<Statistics | null> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('statisticsServiceId', sql.Int, statisticsServiceId);
      const result = await request.query(`
        SELECT reportTypes, dataPoints, visualizationMethods, userRepositoryId
        FROM dbo.StatisticsService
        WHERE statisticsServiceId = @statisticsServiceId
      `);
      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          statisticsServiceId,
          reportTypes: JSON.parse(record.reportTypes),
          dataPoints: record.dataPoints,
          visualizationMethods: JSON.parse(record.visualizationMethods),
          userRepositoryId: record.userRepositoryId
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching statistics service:', error);
      throw new Error('Failed to retrieve statistics service');
    } finally {
      pool.close();
    }
  }

  public async updateStatisticsService(statisticsServiceId: number, request: StatisticsRequest): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const requestDb = pool.request();
      requestDb.input('statisticsServiceId', sql.Int, statisticsServiceId);
      requestDb.input('reportTypes', sql.NVarChar, JSON.stringify(request.reportTypes || []));
      requestDb.input('dataPoints', sql.NVarChar(255), request.dataPoints || '');
      requestDb.input('visualizationMethods', sql.NVarChar, JSON.stringify(request.visualizationMethods || []));
      requestDb.input('userRepositoryId', sql.Int, request.userRepositoryId || null);

      await requestDb.query(`
        UPDATE dbo.StatisticsService
        SET reportTypes = @reportTypes,
            dataPoints = @dataPoints,
            visualizationMethods = @visualizationMethods,
            userRepositoryId = @userRepositoryId
        WHERE statisticsServiceId = @statisticsServiceId
      `);
      return true;
    } catch (error) {
      console.error('Error updating statistics service:', error);
      throw new Error('Failed to update statistics service');
    } finally {
      pool.close();
    }
  }

  public async deleteStatisticsService(statisticsServiceId: number): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('statisticsServiceId', sql.Int, statisticsServiceId);

      await request.query(`
        DELETE FROM dbo.StatisticsService
        WHERE statisticsServiceId = @statisticsServiceId
      `);
      return true;
    } catch (error) {
      console.error('Error deleting statistics service:', error);
      throw new Error('Failed to delete statistics service');
    } finally {
      pool.close();
    }
  }
}