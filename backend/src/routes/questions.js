import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Questions } from '../models/questions.js';

const router = express.Router();

// GET /api/questions/random/:categoryId
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

export default router;