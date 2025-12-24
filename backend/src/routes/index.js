import express from 'express';
import authRoutes from './authRoutes.js';
import themeRoutes from './theme.js';


const router = express.Router();

// Rutas de autenticación
router.use('/auth', authRoutes);
router.use('/theme', themeRoutes);

// Ruta de prueba
router.get('/health', (req, res) => {
    res.send({ status: 'OK', message: 'API de Gestión de Evaluaciones Orales funcionando correctamente' });
});

export default router;