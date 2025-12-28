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

import { Subject } from '../models/subject.js';
import { Student_Subject } from '../models/studentsubject.js';

// PUT /api/terms/:id/current
router.put('/:id/current', async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { id } = req.params;
        const targetTermId = parseInt(id);

        // Repositories bound to the transaction
        const termRepository = queryRunner.manager.getRepository(Term);
        const subjectRepository = queryRunner.manager.getRepository(Subject);
        const studentSubjectRepository = queryRunner.manager.getRepository(Student_Subject);

        // 1. Find the term that is CURRENTLY active (before switch)
        const currentActiveTerm = await termRepository.findOne({ where: { is_current: true } });

        // If there is an active term and it's different from the new one
        if (currentActiveTerm && currentActiveTerm.term_id !== targetTermId) {
            // 2. Find all subjects for this old term
            const oldSubjects = await subjectRepository.find({ where: { term_id: currentActiveTerm.term_id } });
            const oldSubjectIds = oldSubjects.map(s => s.subject_id);

            if (oldSubjectIds.length > 0) {
                // 3. Deactivate students in these subjects
                await studentSubjectRepository
                    .createQueryBuilder()
                    .update(Student_Subject)
                    .set({ status: 'inactive' })
                    .where("subject_id IN (:...ids)", { ids: oldSubjectIds })
                    .execute();
            }
        }

        // 4. Set all terms to not current
        // We use a direct update on the table to ensure we reset everything
        await queryRunner.manager
            .createQueryBuilder()
            .update(Term)
            .set({ is_current: false })
            .where("is_current = :active", { active: true }) // Optimization: only update active ones
            .execute();

        // 5. Set new term to current
        await termRepository.update(targetTermId, { is_current: true });

        await queryRunner.commitTransaction();

        const updatedTerm = await termRepository.findOne({ where: { term_id: targetTermId } });
        res.json(updatedTerm);
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error setting current term:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    } finally {
        await queryRunner.release();
    }
});

export default router;
