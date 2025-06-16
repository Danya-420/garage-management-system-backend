import { connectToDb } from '../config/db';
import sql from 'mssql';
import { SettingsService } from './settings.service';

export interface PaymentServiceRequest {
  userId?: number;
  supportedPaymentMethods?: string[];
  transactionFees?: number;
  paymentProviders?: string[];
  isActive?: boolean;
}

export interface Payment {
  paymentId: number;
  userId: number;
  untilId: number;
  paymentServiceId: number;
  amount: number;
  transactionFees: number;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface PaymentHistory {
  paymentId: number;
  userId: number;
  transactionDate: Date | null;
  amount: number;
  paymentMethod: string | null;
  status: string | null;
}

export class PaymentService {
  private async getConnection(): Promise<any> {
    const pool = await connectToDb();
    return pool;
  }

  public async createPaymentService(userId: number, request: PaymentServiceRequest): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const requestDb = pool.request();
      requestDb.input('userId', sql.Int, userId);
      requestDb.input('supportedPaymentMethods', sql.NVarChar, JSON.stringify(request.supportedPaymentMethods || []));
      requestDb.input('transactionFees', sql.Decimal(5, 2), request.transactionFees || 0);
      requestDb.input('paymentProviders', sql.NVarChar, JSON.stringify(request.paymentProviders || []));
      requestDb.input('isActive', sql.Bit, request.isActive || false);

      await requestDb.query(`
        INSERT INTO dbo.PaymentService (userId, supportedPaymentMethods, transactionFees, paymentProviders, isActive)
        VALUES (@userId, @supportedPaymentMethods, @transactionFees, @paymentProviders, @isActive)
      `);
      return true;
    } catch (error) {
      console.error('Error creating payment service:', error);
      throw new Error('Failed to create payment service');
    } finally {
      pool.close();
    }
  }

  public async getPaymentService(userId: number): Promise<PaymentServiceRequest | null> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`
        SELECT supportedPaymentMethods, transactionFees, paymentProviders, isActive
        FROM dbo.PaymentService
        WHERE userId = @userId
      `);
      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          supportedPaymentMethods: JSON.parse(record.supportedPaymentMethods),
          transactionFees: parseFloat(record.transactionFees),
          paymentProviders: JSON.parse(record.paymentProviders),
          isActive: record.isActive
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching payment service:', error);
      throw new Error('Failed to retrieve payment service');
    } finally {
      pool.close();
    }
  }

  public async updatePaymentService(userId: number, request: PaymentServiceRequest): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const requestDb = pool.request();
      requestDb.input('userId', sql.Int, userId);
      requestDb.input('supportedPaymentMethods', sql.NVarChar, JSON.stringify(request.supportedPaymentMethods || []));
      requestDb.input('transactionFees', sql.Decimal(5, 2), request.transactionFees || 0);
      requestDb.input('paymentProviders', sql.NVarChar, JSON.stringify(request.paymentProviders || []));
      requestDb.input('isActive', sql.Bit, request.isActive || false);

      await requestDb.query(`
        UPDATE dbo.PaymentService
        SET supportedPaymentMethods = @supportedPaymentMethods,
            transactionFees = @transactionFees,
            paymentProviders = @paymentProviders,
            isActive = @isActive
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error updating payment service:', error);
      throw new Error('Failed to update payment service');
    } finally {
      pool.close();
    }
  }

  public async createPayment(userId: number, untilId: number, paymentServiceId: number, amount: number, transactionFees: number, description: string, status: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('untilId', sql.Int, untilId);
      request.input('paymentServiceId', sql.Int, paymentServiceId);
      request.input('amount', sql.Decimal(10, 2), amount);
      request.input('transactionFees', sql.Decimal(5, 2), transactionFees);
      request.input('description', sql.NVarChar(255), description);
      request.input('status', sql.NVarChar(20), status);

      await request.query(`
        INSERT INTO dbo.Payments (userId, untilId, paymentServiceId, amount, transactionFees, description, status, createdAt, updatedAt)
        VALUES (@userId, @untilId, @paymentServiceId, @amount, @transactionFees, @description, @status, GETDATE(), NULL)
      `);
      return true;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    } finally {
      pool.close();
    }
  }

 public async getPayments(userId: number): Promise<Payment[]> {
  const pool = await this.getConnection();
  try {
    const request = pool.request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(`
      SELECT paymentId, userId, untilId, paymentServiceId, amount, transactionFees, description, status, createdAt, updatedAt
      FROM dbo.Payments
      WHERE userId = @userId
    `);
    return result.recordset.map((row: { paymentId: number; userId: number; untilId: number; paymentServiceId: number; amount: number; transactionFees: number; description: string; status: string; createdAt: Date; updatedAt: Date | null }) => ({
      paymentId: row.paymentId,
      userId: row.userId,
      untilId: row.untilId,
      paymentServiceId: row.paymentServiceId,
      amount: row.amount,
      transactionFees: row.transactionFees,
      description: row.description,
      status: row.status,
      createdAt: new Date(row.createdAt),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : null
    }));
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw new Error('Failed to retrieve payments');
  } finally {
    pool.close();
  }
}

  public async updatePaymentStatus(paymentId: number, status: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('paymentId', sql.Int, paymentId);
      request.input('status', sql.NVarChar(20), status);

      await request.query(`
        UPDATE dbo.Payments
        SET status = @status, updatedAt = GETDATE()
        WHERE paymentId = @paymentId
      `);
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    } finally {
      pool.close();
    }
  }

  public async getPaymentHistory(userId: number): Promise<PaymentHistory[]> {
  const pool = await this.getConnection();
  try {
    const request = pool.request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(`
      SELECT paymentId, userId, transactionDate, amount, paymentMethod, status
      FROM dbo.PaymentHistory
      WHERE userId = @userId
    `);
    return result.recordset.map((row: any) => ({
      paymentId: parseInt(row.paymentId), 
      userId: parseInt(row.userId),      
      transactionDate: row.transactionDate ? new Date(row.transactionDate) : null,
      amount: parseFloat(row.amount),    
      paymentMethod: row.paymentMethod,
      status: row.status
    }));
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw new Error('Failed to retrieve payment history');
  } finally {
    pool.close();
  }
}

  public async addPaymentToHistory(paymentId: number, transactionDate: Date | null, paymentMethod: string | null, status: string | null): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('paymentId', sql.Int, paymentId);
      request.input('transactionDate', sql.DateTime, transactionDate || null);
      request.input('paymentMethod', sql.NVarChar(50), paymentMethod || null);
      request.input('status', sql.NVarChar(20), status || null);

      await request.query(`
        INSERT INTO dbo.PaymentHistory (paymentId, userId, transactionDate, amount, paymentMethod, status)
        SELECT paymentId, userId, @transactionDate, amount, @paymentMethod, @status
        FROM dbo.Payments
        WHERE paymentId = @paymentId
      `);
      return true;
    } catch (error) {
      console.error('Error adding payment to history:', error);
      throw new Error('Failed to add payment to history');
    } finally {
      pool.close();
    }
  }
}