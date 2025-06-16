// src/services/feedback.service.ts
import { connectToDb } from '../config/db';
import sql from 'mssql';

export interface FeedbackRequest {
  userId?: number;
  feedbackCategories?: string[];
  satisfactionMetrics?: string;
  resolutionTimeline?: string;
  priorityLevels?: string;
}

export interface Feedback {
  feedbackServiceId: number;
  userId: number;
  feedbackCategories: string[];
  satisfactionMetrics: string;
  resolutionTimeline: string;
  priorityLevels: string;
}

export class FeedbackService {
  private async getConnection(): Promise<any> {
    const pool = await connectToDb();
    return pool;
  }

  public async createFeedback(userId: number, request: FeedbackRequest): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const requestDb = pool.request();
      requestDb.input('userId', sql.Int, userId);
      requestDb.input('feedbackCategories', sql.NVarChar, JSON.stringify(request.feedbackCategories || []));
      requestDb.input('satisfactionMetrics', sql.NVarChar(255), request.satisfactionMetrics || '');
      requestDb.input('resolutionTimeline', sql.NVarChar(255), request.resolutionTimeline || '');
      requestDb.input('priorityLevels', sql.NVarChar(100), request.priorityLevels || '');

      await requestDb.query(`
        INSERT INTO dbo.FeedbackService (userId, feedbackCategories, satisfactionMetrics, resolutionTimeline, priorityLevels)
        VALUES (@userId, @feedbackCategories, @satisfactionMetrics, @resolutionTimeline, @priorityLevels)
      `);
      return true;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw new Error('Failed to create feedback');
    } finally {
      pool.close();
    }
  }

  public async getFeedback(userId: number): Promise<Feedback | null> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`
        SELECT feedbackServiceId, userId, feedbackCategories, satisfactionMetrics, resolutionTimeline, priorityLevels
        FROM dbo.FeedbackService
        WHERE userId = @userId
      `);
      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          feedbackServiceId: record.feedbackServiceId,
          userId: record.userId,
          feedbackCategories: JSON.parse(record.feedbackCategories),
          satisfactionMetrics: record.satisfactionMetrics,
          resolutionTimeline: record.resolutionTimeline,
          priorityLevels: record.priorityLevels
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw new Error('Failed to retrieve feedback');
    } finally {
      pool.close();
    }
  }

  public async updateFeedback(userId: number, request: FeedbackRequest): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const requestDb = pool.request();
      requestDb.input('userId', sql.Int, userId);
      requestDb.input('feedbackCategories', sql.NVarChar, JSON.stringify(request.feedbackCategories || []));
      requestDb.input('satisfactionMetrics', sql.NVarChar(255), request.satisfactionMetrics || '');
      requestDb.input('resolutionTimeline', sql.NVarChar(255), request.resolutionTimeline || '');
      requestDb.input('priorityLevels', sql.NVarChar(100), request.priorityLevels || '');

      await requestDb.query(`
        UPDATE dbo.FeedbackService
        SET feedbackCategories = @feedbackCategories,
            satisfactionMetrics = @satisfactionMetrics,
            resolutionTimeline = @resolutionTimeline,
            priorityLevels = @priorityLevels
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw new Error('Failed to update feedback');
    } finally {
      pool.close();
    }
  }

  public async deleteFeedback(userId: number): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);

      await request.query(`
        DELETE FROM dbo.FeedbackService
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw new Error('Failed to delete feedback');
    } finally {
      pool.close();
    }
  }
}