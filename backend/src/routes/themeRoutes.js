import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Theme } from '../models/theme.js';
import { createThemeValidation, updateThemeValidation } from '../validations/themeValidation.js';

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

// POST /api/theme/create
router.post('/create', async (req, res) => {
    // Validar datos de entrada
    const { error, value } = createThemeValidation.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: "Error de validación",
            errors: error.details.map(detail => detail.message)
        });
    }

    const { theme_name, subject_id } = value;

    try {
        const themeRepository = AppDataSource.getRepository(Theme);
        const newTheme = themeRepository.create({
            theme_name,
            subject_id
        });
        const savedTheme = await themeRepository.save(newTheme);
        res.status(201).json(savedTheme);
    } catch (error) {
        console.error("Error creating theme:", error);
        res.status(500).json({ message: "Error creating theme" });
    }
});

// PUT /api/theme/update/:id
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;

    // Validar datos de entrada
    const { error, value } = updateThemeValidation.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: "Error de validación",
            errors: error.details.map(detail => detail.message)
        });
    }

    const { theme_name } = value;

    try {
        const themeRepository = AppDataSource.getRepository(Theme);
        const theme = await themeRepository.findOneBy({ theme_id: parseInt(id) });
        if (!theme) return res.status(404).json({ message: "Theme not found" });

        theme.theme_name = theme_name;
        const updatedTheme = await themeRepository.save(theme);
        res.json(updatedTheme);
    } catch (error) {
        console.error("Error updating theme:", error);
        res.status(500).json({ message: "Error updating theme" });
    }
});

// DELETE /api/theme/delete/:id
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const themeRepository = AppDataSource.getRepository(Theme);
        const result = await themeRepository.delete(parseInt(id));
        if (result.affected === 0) return res.status(404).json({ message: "Theme not found" });
        res.json({ message: "Theme deleted" });
    } catch (error) {
        console.error("Error deleting theme:", error);
        res.status(500).json({ message: "Error deleting theme" });
    }
});

export default router;
