import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Theme } from '../models/theme.js';

const router = express.Router();

// GET /api/theme
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

// GET /api/theme/by-subject/:subjectId
// Obtiene los temas que pertenecen a una asignatura específica
router.get('/by-subject/:subjectId', async (req, res) => {
    const { subjectId } = req.params;

    try {
        const themeRepository = AppDataSource.getRepository(Theme);

        const themes = await themeRepository
            .createQueryBuilder("theme")
            .where("theme.subject_id = :subjectId", { subjectId })
            .getMany();

        res.json(themes);
    } catch (error) {
        console.error("Error al obtener temas por asignatura:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default router;
