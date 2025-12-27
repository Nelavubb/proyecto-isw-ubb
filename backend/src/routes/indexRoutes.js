import express from 'express';
import authRoutes from './authRoutes.js';
import themeRoutes from './themeRoutes.js';
import subjectRoutes from './subjectRoutes.js';
import questionRoutes from './questionRoutes.js';
import usersRoutes from './usersRoutes.js';
import guidelineRoutes from './guidelineRoutes.js';
import historyRoutes from './historyRoutes.js';
import evaluationRoutes from './evaluationRoutes.js';

const router = express.Router();

// Rutas de autenticación
router.use('/auth', authRoutes);
router.use('/theme', themeRoutes);
router.use('/subjects', subjectRoutes);
router.use('/questions', questionRoutes);
router.use('/Users', usersRoutes);
router.use('/guidelines', guidelineRoutes);
router.use('/history', historyRoutes);
router.use('/evaluation-details', evaluationRoutes);

export default router;
