import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Student_Subject } from '../models/studentsubject.js';
import { studentSubjectValidation } from '../validations/studentsubjectValidations.js';

const router = express.Router();

// GET /api/student-subjects
router.get('/', async (req, res) => {
    try {
        const repo = AppDataSource.getRepository(Student_Subject);
        const results = await repo.find({ relations: ['user', 'subject'] });
        res.json(results);
    } catch (error) {
        console.error("Error getting student subjects:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/student-subjects
router.post('/', async (req, res) => {
    try {
        await studentSubjectValidation.validateAsync(req.body);

        const { user_id, subject_id, status } = req.body;
        const repo = AppDataSource.getRepository(Student_Subject);

        // Check if already exists
        const existing = await repo.findOne({ where: { user_id, subject_id } });
        if (existing) {
            return res.status(400).json({ message: "El estudiante ya está asociado a esta asignatura" });
        }

        const newRelation = repo.create({ user_id, subject_id, status });
        await repo.save(newRelation);

        res.status(201).json(newRelation);
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ message: error.details[0].message });
        }
        console.error("Error creating student subject:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});
// DELETE /api/student-subjects/:subjectId/:userId
router.delete('/:subjectId/:userId', async (req, res) => {
    try {
        const { subjectId, userId } = req.params;
        const repo = AppDataSource.getRepository(Student_Subject);

        const relation = await repo.findOne({
            where: {
                subject_id: parseInt(subjectId),
                user_id: parseInt(userId)
            }
        });

        if (!relation) {
            return res.status(404).json({ message: "Relación no encontrada" });
        }

        await repo.remove(relation);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting student subject:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/student-subjects/:subjectId/:userId
router.put('/:subjectId/:userId', async (req, res) => {
    try {
        const { subjectId, userId } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ message: "Estado inválido" });
        }

        const repo = AppDataSource.getRepository(Student_Subject);
        const relation = await repo.findOne({
            where: {
                subject_id: parseInt(subjectId),
                user_id: parseInt(userId)
            }
        });

        if (!relation) {
            return res.status(404).json({ message: "Relación no encontrada" });
        }

        relation.status = status;
        await repo.save(relation);

        res.json(relation);
    } catch (error) {
        console.error("Error updating student subject:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default router;
