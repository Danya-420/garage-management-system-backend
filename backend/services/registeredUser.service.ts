import { connectToDb } from '../config/db';
import sql from 'mssql';
import { RegisteredUser } from '../models/registeredUser.model';

export class RegisteredUserService {
  private async getConnection(): Promise<any> {
    const pool = await connectToDb();
    return pool;
  }

  public async createRegisteredUser(userId: number, membershipId: string, paymentBalance: number, notificationSettings: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('membershipId', sql.NVarChar(50), membershipId);
      request.input('paymentBalance', sql.Decimal(10, 2), paymentBalance);
      request.input('notificationSettings', sql.NVarChar(sql.MAX), notificationSettings);

      await request.query(`
        INSERT INTO dbo.RegisteredUser (userId, membershipId, paymentBalance, notificationSettings)
        VALUES (@userId, @membershipId, @paymentBalance, @notificationSettings)
      `);
      return true;
    } catch (error) {
      console.error('Error creating registered user:', error);
      throw new Error('Failed to create registered user');
    } finally {
      pool.close();
    }
  }

  public async getRegisteredUser(userId: number): Promise<RegisteredUser | null> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`
        SELECT userId, membershipId, paymentBalance, notificationSettings
        FROM dbo.RegisteredUser
        WHERE userId = @userId
      `);
      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          userId: record.userId,
          membershipId: record.membershipId,
          paymentBalance: record.paymentBalance,
          notificationSettings: record.notificationSettings
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching registered user:', error);
      throw new Error('Failed to retrieve registered user');
    } finally {
      pool.close();
    }
  }

  public async updateRegisteredUser(userId: number, membershipId: string, paymentBalance: number, notificationSettings: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('membershipId', sql.NVarChar(50), membershipId);
      request.input('paymentBalance', sql.Decimal(10, 2), paymentBalance);
      request.input('notificationSettings', sql.NVarChar(sql.MAX), notificationSettings);

      await request.query(`
        UPDATE dbo.RegisteredUser
        SET membershipId = @membershipId,
            paymentBalance = @paymentBalance,
            notificationSettings = @notificationSettings
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error updating registered user:', error);
      throw new Error('Failed to update registered user');
    } finally {
      pool.close();
    }
  }

  public async deleteRegisteredUser(userId: number): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);

      await request.query(`
        DELETE FROM dbo.RegisteredUser
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error deleting registered user:', error);
      throw new Error('Failed to delete registered user');
    } finally {
      pool.close();
    }
  }
}