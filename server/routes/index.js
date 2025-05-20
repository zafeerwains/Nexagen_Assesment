import express from 'express';
import authRoutes from './authRoutes';
import noteRoutes from './noteRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/notes', noteRoutes);

export default router;