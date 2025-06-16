import { Router } from 'express';
import { Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { 
  uploadProfilePhoto, 
  updateName, 
  changePassword, 
  changeEmail, 
  toggleEmailNotifications, 
  updateTimeFormat, 
  updateLanguage, 
  updateTheme,
  getSettings 
} from '../controllers/settings.controller';
import upload from '../middleware/upload.middleware';

const router = Router();

router.post('/profile/photo', verifyToken, upload.single('photo'), async (req: Request, res: Response) => {
  try {
    await uploadProfilePhoto(req, res);
  } catch (error) {
    console.error('Route upload profile photo error:', error);
    res.status(500).json({ message: 'Failed to upload profile photo.' });
  }
});

router.post('/name', verifyToken, async (req: Request, res: Response) => {
  try {
    await updateName(req, res);
  } catch (error) {
    console.error('Route update name error:', error);
    res.status(500).json({ message: 'Failed to update name.' });
  }
});

router.post('/password', verifyToken, async (req: Request, res: Response) => {
  try {
    await changePassword(req, res);
  } catch (error) {
    console.error('Route change password error:', error);
    res.status(500).json({ message: 'Failed to change password.' });
  }
});

router.post('/email', verifyToken, async (req: Request, res: Response) => {
  try {
    await changeEmail(req, res);
  } catch (error) {
    console.error('Route change email error:', error);
    res.status(500).json({ message: 'Failed to change email.' });
  }
});

router.post('/notifications/email', verifyToken, async (req: Request, res: Response) => {
  try {
    await toggleEmailNotifications(req, res);
  } catch (error) {
    console.error('Route toggle email notifications error:', error);
    res.status(500).json({ message: 'Failed to toggle email notifications.' });
  }
});

router.post('/time-format', verifyToken, async (req: Request, res: Response) => {
  try {
    await updateTimeFormat(req, res);
  } catch (error) {
    console.error('Route update time format error:', error);
    res.status(500).json({ message: 'Failed to update time format.' });
  }
});

router.post('/language', verifyToken, async (req: Request, res: Response) => {
  try {
    await updateLanguage(req, res);
  } catch (error) {
    console.error('Route update language error:', error);
    res.status(500).json({ message: 'Failed to update language.' });
  }
});

router.post('/theme', verifyToken, async (req: Request, res: Response) => {
  try {
    await updateTheme(req, res);
  } catch (error) {
    console.error('Route update theme error:', error);
    res.status(500).json({ message: 'Failed to update theme.' });
  }
});

router.get('/settings', verifyToken, async (req: Request, res: Response) => {
  try {
    await getSettings(req, res);
  } catch (error) {
    console.error('Route get settings error:', error);
    res.status(500).json({ message: 'Failed to retrieve settings.' });
  }
});

export default router;