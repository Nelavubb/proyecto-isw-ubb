import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Term } from '../models/term.js';
import { termValidation } from '../validations/termValidations.js';

const router = express.Router();

// GET /api/terms
router.get('/', async (req, res) => {
    try {
        const termRepository = AppDataSource.getRepository(Term);
        const terms = await termRepository.find();
        res.json(terms);
    } catch (error) {
        console.error("Error getting terms:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/terms
router.post('/', async (req, res) => {
    try {
        await termValidation.validateAsync(req.body);

        const { code, is_current } = req.body;
        const termRepository = AppDataSource.getRepository(Term);

        // Check uniqueness if needed (logic specific to business rules, assumed yes for code)
        const existing = await termRepository.findOne({ where: { code } });
        if (existing) {
            return res.status(400).json({ message: "El periodo ya existe" });
        }

        // If setting as current, unset others? (Optional logic, but common)
        if (is_current) {
            await termRepository.update({}, { is_current: false });
        }

        const newTerm = termRepository.create({ code, is_current });
        await termRepository.save(newTerm);

        res.status(201).json(newTerm);
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ message: error.details[0].message });
        }
        console.error("Error creating term:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default router;
