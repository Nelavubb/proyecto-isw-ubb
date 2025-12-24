import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Theme } from '../models/theme.js';

const router = express.Router();

// GET /api/themes
router.get('/', async (req, res) => {
    try {
        const themeRepository = AppDataSource.getRepository(Theme);
        const theme = await themeRepository.find();
        res.json(theme);
    } catch (error) {
        console.error("Error obteniendo temas:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

export default router;