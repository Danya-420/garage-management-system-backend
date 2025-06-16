// src/controllers/feedback.controller.ts
import { Request, Response } from 'express';
import { FeedbackService, FeedbackRequest, Feedback } from '../services/feedback.service';

const feedbackService = new FeedbackService();

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { feedbackCategories, satisfactionMetrics, resolutionTimeline, priorityLevels } = req.body;
    const request: FeedbackRequest = { feedbackCategories, satisfactionMetrics, resolutionTimeline, priorityLevels };
    await feedbackService.createFeedback(userId, request);
    res.status(201).json({ message: 'Feedback created successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to create feedback' });
  }
};

export const getFeedback = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const feedback = await feedbackService.getFeedback(userId);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to retrieve feedback' });
  }
};

export const updateFeedback = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    const { feedbackCategories, satisfactionMetrics, resolutionTimeline, priorityLevels } = req.body;
    const request: FeedbackRequest = { feedbackCategories, satisfactionMetrics, resolutionTimeline, priorityLevels };
    await feedbackService.updateFeedback(userId, request);
    res.status(200).json({ message: 'Feedback updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update feedback' });
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as number;
    await feedbackService.deleteFeedback(userId);
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to delete feedback' });
  }
};