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
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const validatedData = await termValidation.validateAsync(req.body);
        const { code, is_current } = validatedData;

        const termRepository = queryRunner.manager.getRepository(Term);

        const existing = await termRepository.findOne({ where: { code } });
        if (existing) {
            await queryRunner.rollbackTransaction();
            return res.status(400).json({ message: "El periodo ya existe" });
        }

        // If setting as current, unset others
        if (is_current) {
            await queryRunner.manager
                .createQueryBuilder()
                .update(Term)
                .set({ is_current: false })
                .where("is_current = :active", { active: true })
                .execute();
        }

        const newTerm = termRepository.create({ code, is_current });
        await termRepository.save(newTerm);

        await queryRunner.commitTransaction();
        res.status(201).json(newTerm);
    } catch (error) {
        await queryRunner.rollbackTransaction();
        if (error.isJoi) {
            return res.status(400).json({ message: error.details[0].message });
        }
        console.error("Error creating term:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    } finally {
        await queryRunner.release();
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

        const termRepository = queryRunner.manager.getRepository(Term);
        const subjectRepository = queryRunner.manager.getRepository(Subject);
        const studentSubjectRepository = queryRunner.manager.getRepository(Student_Subject);

        const currentActiveTerm = await termRepository.findOne({ where: { is_current: true } });

        if (currentActiveTerm && currentActiveTerm.term_id !== targetTermId) {
            const oldSubjects = await subjectRepository.find({ where: { term_id: currentActiveTerm.term_id } });
            const oldSubjectIds = oldSubjects.map(s => s.subject_id);

            if (oldSubjectIds.length > 0) {
                await studentSubjectRepository
                    .createQueryBuilder()
                    .update(Student_Subject)
                    .set({ status: 'inactive' })
                    .where("subject_id IN (:...ids)", { ids: oldSubjectIds })
                    .execute();
            }
        }

        await queryRunner.manager
            .createQueryBuilder()
            .update(Term)
            .set({ is_current: false })
            .where("is_current = :active", { active: true })
            .execute();

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
