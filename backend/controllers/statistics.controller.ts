// src/controllers/statistics.controller.ts
import { Request, Response } from 'express';
import { StatisticsService, StatisticsRequest, Statistics } from '../services/statistics.service';

const statisticsService = new StatisticsService();

export const createStatisticsService = async (req: Request, res: Response) => {
  try {
    const { statisticsServiceId, reportTypes, dataPoints, visualizationMethods, userRepositoryId } = req.body;
    if (!statisticsServiceId) return res.status(400).json({ message: 'statisticsServiceId is required' });
    const request: StatisticsRequest = { reportTypes, dataPoints, visualizationMethods, userRepositoryId };
    await statisticsService.createStatisticsService(statisticsServiceId, request);
    res.json({ message: 'Statistics service created successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to create statistics service' });
  }
};

export const getStatisticsService = async (req: Request, res: Response) => {
  try {
    const { statisticsServiceId } = req.params;
    if (!statisticsServiceId) return res.status(400).json({ message: 'statisticsServiceId is required' });
    const service = await statisticsService.getStatisticsService(parseInt(statisticsServiceId));
    if (!service) return res.status(404).json({ message: 'Statistics service not found' });
    res.json(service);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to retrieve statistics service' });
  }
};

export const updateStatisticsService = async (req: Request, res: Response) => {
  try {
    const { statisticsServiceId } = req.params;
    if (!statisticsServiceId) return res.status(400).json({ message: 'statisticsServiceId is required' });
    const { reportTypes, dataPoints, visualizationMethods, userRepositoryId } = req.body;
    const request: StatisticsRequest = { reportTypes, dataPoints, visualizationMethods, userRepositoryId };
    await statisticsService.updateStatisticsService(parseInt(statisticsServiceId), request);
    res.json({ message: 'Statistics service updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update statistics service' });
  }
};

export const deleteStatisticsService = async (req: Request, res: Response) => {
  try {
    const { statisticsServiceId } = req.params;
    if (!statisticsServiceId) return res.status(400).json({ message: 'statisticsServiceId is required' });
    await statisticsService.deleteStatisticsService(parseInt(statisticsServiceId));
    res.json({ message: 'Statistics service deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to delete statistics service' });
  }
};