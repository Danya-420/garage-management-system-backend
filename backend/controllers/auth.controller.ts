import { Request, Response } from 'express';
import { registerUser, loginUser, changePassword, confirmPasswordChange, getUserById, updateUser, updateUserPhotoUrl, generatePasswordResetToken } from '../services/auth.service'; 
import path from 'path';

export const register = async (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }

    try {
        await registerUser(name, email, phone, password);
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
        if (error?.originalError?.info?.number === 2627) { 
            return res.status(409).json({ message: 'Email already exists' });
        }

        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const result = await loginUser(email, password); 
        if (!result) {
            return res.status(401).json({ message: 'Invalid credentials' }); 
        }

        return res.status(200).json(result); 
    } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Login failed due to server error' }); 
    }
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }
    await changePassword(userId, oldPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Failed to change password' });
  }
};

export const confirmPasswordResetHandler = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }
    const success = await confirmPasswordChange(token);
    if (success) {
      res.json({ message: 'Password reset successfully.' });
    } else {
      res.status(400).json({ error: 'Failed to reset password.' });
    }
  } catch (err: any) {
    console.error('Confirm password reset error:', err);
    res.status(400).json({ error: err.message || 'Помилка скидання пароля' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId as number; 

        if (!userId) {
            return res.status(401).json({ message: 'User ID not found in token.' });
        }

        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ message: 'Failed to retrieve profile data.' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId as number;
        if (!userId) {
            return res.status(401).json({ message: 'User ID not found in token.' });
        }

        const { name, email, phone, password } = req.body;
        const updates: { name?: string; email?: string; phone?: string; password?: string } = {};

        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (password !== undefined) updates.password = password;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        const success = await updateUser(userId, updates);

        if (!success) {
            return res.status(400).json({ message: 'Failed to update profile or no changes were made.' });
        }

        return res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error: any) {
        if (error?.originalError?.info?.number === 2627) {
            return res.status(409).json({ message: 'Email already exists for another user.' });
        }
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Failed to update profile.' });
    }
};

export const uploadProfilePhoto = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId as number;
        if (!userId) {
            return res.status(401).json({ message: 'User ID not found in token.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const photoUrl = `/uploads/${req.file.filename}`; 

        const success = await updateUserPhotoUrl(userId, photoUrl);

        if (!success) {
            return res.status(500).json({ message: 'Failed to update photo URL in database.' });
        }

        return res.status(200).json({ message: 'Profile photo uploaded successfully.', photoUrl });
    } catch (error) {
        console.error('Upload profile photo error:', error);
        return res.status(500).json({ message: 'Failed to upload profile photo.' });
    }
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const resetToken = await generatePasswordResetToken(email);

        console.log(`Password reset token for ${email}: ${resetToken}`); 

        return res.status(200).json({ message: 'Password reset link sent to your email (check console for token).' });
    } catch (error: any) {
        console.error('Forgot password handler error:', error);
        if (error.message === 'User with that email does not exist.') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Failed to process forgot password request.' });
    }
};

