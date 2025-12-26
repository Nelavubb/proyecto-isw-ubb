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
            .leftJoinAndSelect("question.user", "user")
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
            .leftJoinAndSelect("question.user", "user")
            .limit(limit)
            .getMany();

        res.json(questions);
    } catch (error) {
        console.error("Error al obtener preguntas:", error);
        res.status(500).json({ message: "Error interno" });
    }
});

// POST /api/questions/create
router.post('/create', async (req, res) => {
    const { question_text, answer, theme_id, user_id } = req.body;

    try {
        const questionRepository = AppDataSource.getRepository(Questions);
        const newQuestion = questionRepository.create({
            question_text,
            answer,
            theme_id,
            user_id: user_id || 3, // Default to 3 (Profesor) if not provided
            created_at: new Date(),
            updated_at: new Date()
        });

        const savedQuestion = await questionRepository.save(newQuestion);
        res.status(201).json(savedQuestion);
    } catch (error) {
        console.error("Error al crear la pregunta:", error);
        res.status(500).json({ message: "Error interno al guardar la pregunta" });
    }
});

// GET /api/questions/by-theme/:themeId
router.get('/by-theme/:themeId', async (req, res) => {
    const { themeId } = req.params;
    try {
        const questionRepository = AppDataSource.getRepository(Questions);
        const questions = await questionRepository.find({
            where: { theme_id: parseInt(themeId) },
            relations: ['user'],
            order: { created_at: 'DESC' }
        });

        res.json(questions);
    } catch (error) {
        console.error("Error al obtener preguntas por tema:", error);
        res.status(500).json({ message: "Error interno" });
    }
});

// GET /api/questions/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const questionRepository = AppDataSource.getRepository(Questions);
        const question = await questionRepository.findOne({
            where: { id_question: parseInt(id) },
            relations: ['user']
        });

        if (!question) {
            return res.status(404).json({ message: "Pregunta no encontrada" });
        }

        res.json(question);
    } catch (error) {
        console.error("Error al obtener la pregunta:", error);
        res.status(500).json({ message: "Error interno" });
    }
});

// PUT /api/questions/update/:id
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { question_text, answer, theme_id } = req.body;

    try {
        const questionRepository = AppDataSource.getRepository(Questions);
        const question = await questionRepository.findOne({
            where: { id_question: parseInt(id) }
        });

        if (!question) {
            return res.status(404).json({ message: "Pregunta no encontrada" });
        }

        question.question_text = question_text;
        question.answer = answer;
        question.theme_id = theme_id;
        question.updated_at = new Date(); // Manually update timestamp

        const updatedQuestion = await questionRepository.save(question);
        res.json(updatedQuestion);
    } catch (error) {
        console.error("Error al actualizar la pregunta:", error);
        res.status(500).json({ message: "Error interno al actualizar" });
    }
});

export default router;