// src/controllers/settings.controller.ts
import { Request, Response } from 'express';
import { SettingsService, ThemeRequestBody } from '../services/settings.service';

const settingsService = new SettingsService();

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    if (!req.file) return res.status(400).json({ message: 'No photo uploaded.' });
    const pictureUrl = `/uploads/${req.file.filename}`;
    await settingsService.updateProfilePicture(userId, pictureUrl);
    res.json({ message: 'Profile photo uploaded successfully' });
  } catch (error) {
    console.error('Controller upload profile photo error:', error);
    res.status(500).json({ message: 'Failed to upload profile photo.' });
  }
};

export const updateName = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ message: 'New name is required' });
    await settingsService.updateName(userId, newName);
    res.json({ message: 'Name updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Old and new passwords are required' });
    await settingsService.changePassword(userId, oldPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(401).json({ message: err.message || 'Failed to change password' });
  }
};

export const changeEmail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ message: 'New email is required' });
    await settingsService.changeEmail(userId, newEmail);
    res.json({ message: 'Email change initiated. Check your email for confirmation' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

export const toggleEmailNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') return res.status(400).json({ message: 'Enabled must be a boolean' });
    await settingsService.toggleEmailNotifications(userId, enabled);
    res.json({ message: `Email notifications ${enabled ? 'enabled' : 'disabled'} successfully` });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

export const updateTimeFormat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { timeFormat } = req.body;
    if (!timeFormat || !['12h', '24h'].includes(timeFormat)) return res.status(400).json({ message: 'Invalid time format' });
    await settingsService.updateTimeFormat(userId, timeFormat);
    res.json({ message: 'Time format updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

export const updateLanguage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { language } = req.body;
    if (!language || !['English', 'Ukrainian'].includes(language)) return res.status(400).json({ message: 'Invalid language' });
    await settingsService.updateLanguage(userId, language);
    res.json({ message: 'Language updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

export const updateTheme = async (req: Request<{}, {}, Pick<ThemeRequestBody, 'mode' | 'background' | 'fontSize'>>, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { mode, background, fontSize } = req.body;

    const theme: Partial<ThemeRequestBody> = {};
    if (mode && ['light', 'dark', 'default'].includes(mode)) theme.mode = mode;
    if (background && ['default', 'custom'].includes(background)) theme.background = background;
    if (fontSize && [12, 16, 20, 24].includes(fontSize)) theme.fontSize = fontSize;

    if (Object.keys(theme).length === 0) {
      return res.status(400).json({ message: 'At least one theme parameter is required' });
    }

    await settingsService.updateTheme(userId, theme);
    res.json({ message: 'Theme updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

export const updateAllSettings = async (req: Request<{}, {}, ThemeRequestBody>, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const settings = req.body;

    if (Object.keys(settings).length === 0) {
      return res.status(400).json({ message: 'At least one setting is required' });
    }

    await settingsService.updateAllSettings(userId, settings);
    res.json({ message: 'Settings updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const settings = await settingsService.getUserSettings(userId);
    res.json({ settings });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};