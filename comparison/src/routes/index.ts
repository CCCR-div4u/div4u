import express from 'express';
import comparisonRoutes from './comparison';
import healthRoutes from './health';

const router = express.Router();

// Mount routes
router.use('/comparison', healthRoutes);
router.use('/comparison', comparisonRoutes);

export default router;