import { Request, Response } from 'express';
import { GarageUnitService } from '../services/garage.service';
import { GarageUnit } from '../models/garage.model'; 

const garageUnitService = new GarageUnitService();

export const assignUnitToUser = async (req: Request, res: Response) => {
  const { unitId, userId } = req.body;
  if (!unitId || !userId) return res.status(400).json({ message: 'Unit ID and User ID are required' });

  const success = await garageUnitService.assignToUser(unitId, userId);
  if (success) {
    res.status(200).json({ message: 'Garage unit assigned successfully' });
  } else {
    res.status(400).json({ message: 'Failed to assign garage unit' });
  }
};

export const updateAccessRights = async (req: Request, res: Response) => {
  const { unitId, userId, accessRights } = req.body;
  if (!unitId || !userId || !accessRights) return res.status(400).json({ message: 'Unit ID, User ID, and Access Rights are required' });

  await garageUnitService.updateAccessRights(unitId, userId, accessRights);
  res.status(200).json({ message: 'Access rights updated successfully' });
};

export const getUnitProperties = async (req: Request, res: Response) => {
  const { unitId } = req.params;
  if (!unitId) return res.status(400).json({ message: 'Unit ID is required' });

  const properties: GarageUnit | null = await garageUnitService.getUnitProperties(parseInt(unitId));
  if (properties) {
    res.status(200).json(properties);
  } else {
    res.status(404).json({ message: 'Garage unit not found' });
  }
};

export const updateUnitStatus = async (req: Request, res: Response) => {
  const { unitId, status } = req.body;
  if (!unitId || !status) return res.status(400).json({ message: 'Unit ID and Status are required' });

  await garageUnitService.updateUnitStatus(unitId, status);
  res.status(200).json({ message: 'Unit status updated successfully' });
};
