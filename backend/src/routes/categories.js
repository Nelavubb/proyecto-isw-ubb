import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Categories } from '../models/categories.js';

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categoryRepository = AppDataSource.getRepository(Categories);
        const categories = await categoryRepository.find();
        res.json(categories);
    } catch (error) {
        console.error("Error obteniendo categorías:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

export default router;