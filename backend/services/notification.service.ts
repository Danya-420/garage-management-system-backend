// src/services/notification.service.ts
import nodemailer from 'nodemailer';
import { connectToDb } from '../config/db';
import sql from 'mssql';
import { User } from '../models/user.model';

interface NotificationOptions {
  userId: number;
  subject: string;
  html: string;
  channel?: 'email'; 
}

export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async getUserContact(userId: number): Promise<User | null> {
    try {
      const pool = await connectToDb();
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(
        `SELECT email, phone FROM Users WHERE userId = @userId`
      );
      if (result.recordset.length > 0) {
        return {
          userId: result.recordset[0].userId,
          email: result.recordset[0].email,
          phone: result.recordset[0].phone,
          name: result.recordset[0].name,
          passwordHash: '',
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching user contact:', err);
      throw new Error('Failed to fetch user contact');
    }
  }

  public async sendNotification(options: NotificationOptions): Promise<boolean> {
    const user = await this.getUserContact(options.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (options.channel === 'email' || !options.channel) {
      try {
        await this.transporter.sendMail({
          from: `"Garage Cooperative" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: options.subject,
          html: options.html,
        });
        console.log(`Email sent to ${user.email}`);
        return true;
      } catch (err) {
        console.error('Error sending email:', err);
        throw new Error('Failed to send email');
      }
    }
   
    return false;
  }

  generateConfirmationEmail(confirmationUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Change Confirmation</h2>
        <p>Your password has been successfully changed. Please confirm this action by clicking the button below.</p>
        <a href="${confirmationUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
           Confirm Password Change
        </a>
        <p>If you did not initiate this change, please contact support immediately.</p>
        <p>Garage Cooperative Team</p>
      </div>
    `;
  }
}