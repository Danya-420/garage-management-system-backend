// src/services/settings.service.ts
import { connectToDb } from '../config/db';
import sql from 'mssql';
import { NotificationService } from './notification.service';
import bcrypt from 'bcrypt';

// Інтерфейс для всіх налаштувань
export interface ThemeRequestBody {
  pictureUrl?: string;
  newName?: string;
  oldPassword?: string;
  newPassword?: string;
  newEmail?: string;
  emailNotifications?: boolean;
  timeFormat?: '12h' | '24h';
  language?: 'English' | 'Ukrainian';
  mode?: 'light' | 'dark' | 'default';
  background?: 'default' | 'custom';
  fontSize?: 12 | 16 | 20 | 24;
}

export interface ThemeSettings {
  mode?: 'light' | 'dark' | 'default';
  background?: 'default' | 'custom';
  fontSize?: 12 | 16 | 20 | 24;
}

export interface UserSettings {
  theme?: ThemeSettings;
  timeFormat?: '12h' | '24h';
  language?: 'English' | 'Ukrainian';
}

const notificationService = new NotificationService();

export class SettingsService {
  private async getConnection(): Promise<any> {
    const pool = await connectToDb();
    return pool;
  }

  public async updateProfilePicture(userId: number, pictureUrl: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('pictureUrl', sql.NVarChar, pictureUrl);
      await request.query(`
        UPDATE Users SET profilePicture = @pictureUrl WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw new Error('Failed to update profile picture');
    } finally {
      pool.close();
    }
  }

  public async updateName(userId: number, newName: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('newName', sql.NVarChar, newName);
      await request.query(`
        UPDATE Users SET name = @newName WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error updating name:', error);
      throw new Error('Failed to update name');
    } finally {
      pool.close();
    }
  }

  public async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`SELECT passwordHash FROM Users WHERE userId = @userId`);
      const user = result.recordset[0];
      if (!user) throw new Error('User not found');

      const ok = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!ok) throw new Error('Old password is incorrect');

      const newHash = await bcrypt.hash(newPassword, 10);
      await request.input('newHash', sql.NVarChar, newHash).query(`
        UPDATE Users SET passwordHash = @newHash WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Failed to change password');
    } finally {
      pool.close();
    }
  }

  public async changeEmail(userId: number, newEmail: string): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('newEmail', sql.NVarChar, newEmail);
      await request.query(`
        UPDATE Users SET email = @newEmail WHERE userId = @userId
      `);
      const confirmationUrl = `http://localhost:3000/api/auth/confirm-email?userId=${userId}`;
      const html = notificationService.generateConfirmationEmail(confirmationUrl);
      notificationService.sendNotification({ userId, subject: 'Confirm Your Email Change', html })
        .catch(error => console.error('Email notification failed:', error));
      return true;
    } catch (error) {
      console.error('Error changing email:', error);
      throw new Error('Failed to change email');
    } finally {
      pool.close();
    }
  }

  public async toggleEmailNotifications(userId: number, enabled: boolean): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('enabled', sql.Bit, enabled);
      await request.query(`
        UPDATE Users SET notificationSettings = JSON_MODIFY(notificationSettings, '$.emailEnabled', @enabled)
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error toggling email notifications:', error);
      throw new Error('Failed to toggle email notifications');
    } finally {
      pool.close();
    }
  }

  public async updateTimeFormat(userId: number, timeFormat: '12h' | '24h'): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('timeFormat', sql.NVarChar, timeFormat);
      await request.query(`
        UPDATE Users SET settings = JSON_MODIFY(settings, '$.timeFormat', @timeFormat)
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error updating time format:', error);
      throw new Error('Failed to update time format');
    } finally {
      pool.close();
    }
  }

  public async updateLanguage(userId: number, language: 'English' | 'Ukrainian'): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      request.input('language', sql.NVarChar, language);
      await request.query(`
        UPDATE Users SET settings = JSON_MODIFY(settings, '$.language', @language)
        WHERE userId = @userId
      `);
      return true;
    } catch (error) {
      console.error('Error updating language:', error);
      throw new Error('Failed to update language');
    } finally {
      pool.close();
    }
  }

  public async updateTheme(userId: number, theme: Partial<ThemeSettings>): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`
        SELECT settings
        FROM Users
        WHERE userId = @userId
      `);
      let currentSettings: UserSettings = {};
      if (result.recordset[0]?.settings) {
        try {
          currentSettings = JSON.parse(result.recordset[0].settings);
        } catch (e) {
          console.error('Invalid settings JSON:', e);
        }
      }
      const updatedSettings = {
        ...currentSettings,
        theme: {
          ...currentSettings.theme,
          ...theme
        }
      };
      await request
        .input('settings', sql.NVarChar, JSON.stringify(updatedSettings))
        .query(`
          UPDATE Users
          SET settings = @settings
          WHERE userId = @userId
        `);
      return true;
    } catch (error) {
      console.error('Error updating theme:', error);
      throw new Error('Failed to update theme');
    } finally {
      pool.close();
    }
  }

  public async getUserSettings(userId: number): Promise<UserSettings> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      const result = await request.query(`
        SELECT settings, notificationSettings
        FROM Users
        WHERE userId = @userId
      `);
      if (result.recordset.length > 0) {
        const settings = result.recordset[0].settings ? JSON.parse(result.recordset[0].settings) : {};
        const notificationSettings = result.recordset[0].notificationSettings ? JSON.parse(result.recordset[0].notificationSettings) : {};
        return { ...settings, ...notificationSettings } as UserSettings;
      }
      return {} as UserSettings;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw new Error('Failed to retrieve user settings');
    } finally {
      pool.close();
    }
  }

  public async updateAllSettings(userId: number, settings: ThemeRequestBody): Promise<boolean> {
    const pool = await this.getConnection();
    try {
      const request = pool.request();
      request.input('userId', sql.Int, userId);

      const result = await request.query(`
        SELECT settings, notificationSettings
        FROM Users
        WHERE userId = @userId
      `);
      let currentSettings: UserSettings = {};
      let currentNotificationSettings: { emailEnabled?: boolean } = {};
      if (result.recordset[0]?.settings) {
        try {
          currentSettings = JSON.parse(result.recordset[0].settings);
        } catch (e) {
          console.error('Invalid settings JSON:', e);
        }
      }
      if (result.recordset[0]?.notificationSettings) {
        try {
          currentNotificationSettings = JSON.parse(result.recordset[0].notificationSettings);
        } catch (e) {
          console.error('Invalid notificationSettings JSON:', e);
        }
      }

      if (settings.pictureUrl) await this.updateProfilePicture(userId, settings.pictureUrl);
      if (settings.newName) await this.updateName(userId, settings.newName);
      if (settings.oldPassword && settings.newPassword) await this.changePassword(userId, settings.oldPassword, settings.newPassword);
      if (settings.newEmail) await this.changeEmail(userId, settings.newEmail);

      if (settings.emailNotifications !== undefined) await this.toggleEmailNotifications(userId, settings.emailNotifications);
      if (settings.timeFormat) await this.updateTimeFormat(userId, settings.timeFormat);
      if (settings.language) await this.updateLanguage(userId, settings.language);

      const theme: Partial<ThemeSettings> = {};
      if (settings.mode && ['light', 'dark', 'default'].includes(settings.mode)) theme.mode = settings.mode;
      if (settings.background && ['default', 'custom'].includes(settings.background)) theme.background = settings.background;
      if (settings.fontSize && [12, 16, 20, 24].includes(settings.fontSize)) theme.fontSize = settings.fontSize;
      if (Object.keys(theme).length > 0) await this.updateTheme(userId, theme);

      return true;
    } catch (error) {
      console.error('Error updating all settings:', error);
      throw new Error('Failed to update settings');
    } finally {
      pool.close();
    }
  }
}