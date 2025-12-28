import express from 'express';
import authRoutes from './authRoutes.js';
import themeRoutes from './themeRoutes.js';
import subjectRoutes from './subjectRoutes.js';
import questionRoutes from './questionRoutes.js';
import usersRoutes from './usersRoutes.js';
import guidelineRoutes from './guidelineRoutes.js';
import historyRoutes from './historyRoutes.js';
import evaluationRoutes from './evaluationRoutes.js';
import commissionRoutes from './commissionRoutes.js';
import termRoutes from './termRoutes.js';
import studentSubjectRoutes from './studentSubjectRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = express.Router();

// Rutas de autenticación
router.use('/auth', authRoutes);
router.use('/theme', themeRoutes);
router.use('/subjects', subjectRoutes);
router.use('/questions', questionRoutes);
router.use('/users', usersRoutes);
router.use('/guidelines', guidelineRoutes);
router.use('/history', historyRoutes);
router.use('/evaluation-details', evaluationRoutes);
router.use('/commissions', commissionRoutes);
router.use('/terms', termRoutes);
router.use('/student-subjects', studentSubjectRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
