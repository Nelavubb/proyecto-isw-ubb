import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Questions } from '../models/questions.js';

const router = express.Router();

// GET /api/questions/random/:categoryId (deprecated - kept for backwards compatibility)
router.get('/random/:categoryId', async (req, res) => {
    const { categoryId } = req.params;

    try {
        const questionRepository = AppDataSource.getRepository(Questions);

        // Usamos createQueryBuilder para hacer el RANDOM() compatible con Postgres
        const questions = await questionRepository
            .createQueryBuilder("question")
            .where("question.category_id = :id", { id: categoryId })
            .orderBy("RANDOM()") // Función nativa de PostgreSQL
            .limit(10)
            .getMany();

        res.json(questions);
    } catch (error) {
        console.error("Error al obtener preguntas:", error);
        res.status(500).json({ message: "Error interno" });
    }
});


router.get('/all/:limit', async (req, res) => {
    const { limit } = req.params;

    try {
        const questionRepository = AppDataSource.getRepository(Questions);
        const questions = await questionRepository
            .createQueryBuilder("question")
            .limit(limit)
            .getMany();

        res.json(questions);
    } catch (error) {
        console.error("Error al obtener preguntas:", error);
        res.status(500).json({ message: "Error interno" });
    }
});

/ GET /api / questions / by - theme /: themeId
// Obtiene preguntas aleatorias filtradas por theme_id
router.get('/by-theme/:themeId', async (req, res) => {
    const { themeId } = req.params;

    try {
        const questionRepository = AppDataSource.getRepository(Questions);

        const questions = await questionRepository
            .createQueryBuilder("question")
            .where("question.theme_id = :id", { id: themeId })
            .orderBy("RANDOM()") // Función nativa de PostgreSQL
            .limit(10)
            .getMany();

        res.json(questions);
    } catch (error) {
        console.error("Error al obtener preguntas por tema:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default router;