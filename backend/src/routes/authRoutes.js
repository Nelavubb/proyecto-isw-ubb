import express from 'express';
import { register , login , getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/login', login);
router.post('/register', register);

// Rutas protegidas
router.get('/profile', authMiddleware, getProfile);

export default router;