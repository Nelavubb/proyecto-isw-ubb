import express from 'express';
import authRoutes from './authRoutes.js';
import themeRoutes from './themeRoutes.js';
import subjectRoutes from './subjectRoutes.js';
import questionRoutes from './questionRoutes.js';

const router = express.Router();

// Rutas de autenticación
router.use('/auth', authRoutes);
router.use('/theme', themeRoutes);
router.use('/subjects', subjectRoutes);
router.use('/questions', questionRoutes);

export default router;
