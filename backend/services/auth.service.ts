import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDb } from '../config/db';
import { User } from '../models/user.model';
import crypto from 'crypto'; 
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        const pool = await connectToDb();
        const request = pool.request();
        request.input('email', sql.NVarChar, email);

        const result = await request.query(`SELECT userId, name, email, phone, passwordHash, photoUrl FROM Users WHERE email = @email`);

        if (result.recordset.length > 0) {
            const userRecord = result.recordset[0];
            return {
                userId: userRecord.userId,
                name: userRecord.name,
                email: userRecord.email,
                phone: userRecord.phone,
                passwordHash: userRecord.passwordHash,
                photoUrl: userRecord.photoUrl
            };
        }
        return null;
    } catch (err) {
        console.error('Error fetching user by email:', err);
        throw err;
    }
};

export const getUserById = async (userId: number): Promise<{ userId: number; name: string; email: string; phone: string; photoUrl?: string } | null> => {
    try {
        const pool = await connectToDb();
        const request = pool.request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`SELECT userId, name, email, phone, photoUrl FROM Users WHERE userId = @userId`);

        if (result.recordset.length > 0) {
            const userRecord = result.recordset[0];
            return {
                userId: userRecord.userId,
                name: userRecord.name,
                email: userRecord.email,
                phone: userRecord.phone,
                photoUrl: userRecord.photoUrl
            };
        }
        return null;
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        throw err;
    }
};

export const updateUser = async (
    userId: number,
    updates: { name?: string; email?: string; phone?: string; password?: string }
): Promise<boolean> => {
    try {
        const pool = await connectToDb();
        const request = pool.request();
        request.input('userId', sql.Int, userId);

        let queryParts: string[] = [];
        if (updates.name !== undefined) {
            queryParts.push('name = @name');
            request.input('name', sql.NVarChar, updates.name);
        }
        if (updates.email !== undefined) {
            queryParts.push('email = @email');
            request.input('email', sql.NVarChar, updates.email);
        }
        if (updates.phone !== undefined) {
            queryParts.push('phone = @phone');
            request.input('phone', sql.NVarChar, updates.phone);
        }
        if (updates.password !== undefined) {
            const hashed = await bcrypt.hash(updates.password, 10);
            queryParts.push('passwordHash = @passwordHash');
            request.input('passwordHash', sql.NVarChar, hashed);
        }

        if (queryParts.length === 0) {
            return false;
        }

        const query = `UPDATE Users SET ${queryParts.join(', ')} WHERE userId = @userId`;
        const result = await request.query(query);

        return result.rowsAffected[0] > 0;
    } catch (err) {
        console.error('Error updating user:', err);
        throw err;
    }
};

export const updateUserPhotoUrl = async (userId: number, photoUrl: string): Promise<boolean> => {
    try {
        const pool = await connectToDb();
        const request = pool.request();
        request.input('userId', sql.Int, userId);
        request.input('photoUrl', sql.NVarChar, photoUrl);

        const query = `UPDATE Users SET photoUrl = @photoUrl WHERE userId = @userId`;
        const result = await request.query(query);

        return result.rowsAffected[0] > 0;
    } catch (err) {
        console.error('Error updating user photo URL:', err);
        throw err;
    }
};

export const generatePasswordResetToken = async (email: string): Promise<string> => {
    const user = await getUserByEmail(email);

    if (!user) {
        throw new Error('User with that email does not exist.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); 

    const pool = await connectToDb();
    const request = pool.request();
    request.input('userId', sql.Int, user.userId);
    request.input('resetPasswordToken', sql.NVarChar, resetToken);
    request.input('resetPasswordExpires', sql.DateTime, resetExpires);

    await request.query(`
        UPDATE Users
        SET resetPasswordToken = @resetPasswordToken,
            resetPasswordExpires = @resetPasswordExpires
        WHERE userId = @userId
    `);

    return resetToken;
};


export const registerUser = async (name: string, email: string, phone: string, password: string) => {
    const hashed = await bcrypt.hash(password, 10);

    const pool = await connectToDb();
    const request = pool.request();
    request.input('name', sql.NVarChar, name);
    request.input('email', sql.NVarChar, email);
    request.input('phone', sql.NVarChar, phone);
    request.input('passwordHash', sql.NVarChar, hashed);

    const result = await request.query(`
        INSERT INTO Users (name, email, phone, passwordHash, registrationDate, userStatus)
        VALUES (@name, @email, @phone, @passwordHash, GETDATE(), 'active')
    `);

    return result;
};

export const loginUser = async (
    email: string,
    password: string
): Promise<{ token: string; user: { userId: number; name: string; email: string; phone: string; photoUrl?: string } } | null> => {
    const user = await getUserByEmail(email);

    if (!user || !user.passwordHash) return null;

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;

    const token = jwt.sign(
        { userId: user.userId, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );

    return {
        token,
        user: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            phone: user.phone,
            photoUrl: user.photoUrl
        }
    };
};

export const changePassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string
) => {
  const pool = await connectToDb();
  const req = pool.request();
  req.input('userId', sql.Int, userId);
  const result = await req.query(`SELECT passwordHash FROM Users WHERE userId = @userId`);
  const user = result.recordset[0];
  if (!user) throw new Error('User not found');

  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) throw new Error('Old password is incorrect');

  const newHash = await bcrypt.hash(newPassword, 10);
  const confirmationToken = crypto.randomBytes(32).toString('hex');
  const confirmationExpires = new Date(Date.now() + 3600000); // 1 година

  const upd = pool.request();
  upd.input('userId', sql.Int, userId);
  upd.input('newHash', sql.NVarChar, newHash);
  upd.input('confirmationToken', sql.NVarChar, confirmationToken);
  upd.input('confirmationExpires', sql.DateTime, confirmationExpires);
  await upd.query(`
    UPDATE Users 
    SET passwordHash = @newHash,
        resetPasswordToken = @confirmationToken,
        resetPasswordExpires = @confirmationExpires
    WHERE userId = @userId
  `);

  // Автоматичне підтвердження
  const confirmationSuccess = await confirmPasswordChange(confirmationToken);
  if (!confirmationSuccess) {
    throw new Error('Failed to confirm password change automatically');
  }

  // Email як опціональне сповіщення (не для підтвердження)
  const confirmationUrl = `http://localhost:3000/api/auth/confirm-password?token=${confirmationToken}`;
  const html = notificationService.generateConfirmationEmail(confirmationUrl);
  await notificationService.sendNotification({
    userId,
    subject: 'Password Change Confirmation',
    html,
  });

  return true;
};

export const confirmPasswordChange = async (token: string): Promise<boolean> => {
    let pool;
    try {
      pool = await connectToDb();
      const request = pool.request();
      request.input('token', sql.NVarChar, token);
      const result = await request.query(`
        SELECT userId
        FROM Users
        WHERE resetPasswordToken = @token
        AND resetPasswordExpires > GETDATE()
      `);

      if (result.recordset.length === 0) {
        return false;
      }

      const userId = result.recordset[0].userId as number; // Явна типізація
      const updateRequest = pool.request();
      updateRequest.input('userId', sql.Int, userId);
      await updateRequest.query(`
        UPDATE Users
        SET resetPasswordToken = NULL,
            resetPasswordExpires = NULL
        WHERE userId = @userId
      `);

      return true;
    } catch (err) {
      console.error('Error confirming password change:', err);
      throw new Error('Failed to confirm password change');
    } finally {
      if (pool) pool.close(); 
    }
  };