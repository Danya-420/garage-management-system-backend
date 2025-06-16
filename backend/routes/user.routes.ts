
import { Router } from 'express';
import { getAllUsers, getUserById, updateUserRole } from '../controllers/user.controller';

const router = Router();

router.get('/', getAllUsers); 
router.get('/:id', getUserById); 
router.put('/:id/role', updateUserRole); 

export default router;