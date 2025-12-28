import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Subject } from '../models/subject.js';
import { Student_Subject } from '../models/studentsubject.js';
import { createSubjectValidation, updateSubjectValidation } from '../validations/subjectValidation.js';

const router = express.Router();

// GET /api/subjects/enrolled/:userId
// Obtiene las asignaturas en las que está inscrito un estudiante con status activo
router.get('/enrolled/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const subjectRepository = AppDataSource.getRepository(Subject);

        // JOIN con Student_Subject para obtener solo las asignaturas donde el estudiante está inscrito
        const subjects = await subjectRepository
            .createQueryBuilder("subject")
            .innerJoin(
                "student_subject",
                "ss",
                "ss.subject_id = subject.subject_id"
            )
            .innerJoin("subject.term", "t")
            .where("ss.user_id = :userId", { userId })
            .andWhere("ss.status = :status", { status: 'active' })
            .andWhere("t.is_current = :isCurrent", { isCurrent: true })
            .getMany();

        res.json(subjects);
    } catch (error) {
        console.error("Error al obtener asignaturas inscritas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// GET /api/subjects/by-user/:userId
// Obtiene las asignaturas creadas por un usuario (profesor)
router.get('/by-user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const subjectRepository = AppDataSource.getRepository(Subject);
        const subjects = await subjectRepository.find({
            where: { user_id: parseInt(userId) },
            relations: ['term']
        });

        res.json(subjects);
    } catch (error) {
        console.error("Error al obtener asignaturas por usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// GET /api/subjects
// Obtiene todas las asignaturas
router.get('/', async (req, res) => {
    try {
        const subjectRepository = AppDataSource.getRepository(Subject);
        const subjects = await subjectRepository.find({
            relations: ['user'] // Incluir información del profesor
        });
        res.json(subjects);
    } catch (error) {
        console.error("Error al obtener todas las asignaturas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/subjects
// Crea una nueva asignatura
router.post('/', async (req, res) => {
    try {
        // Validar datos de entrada
        await createSubjectValidation.validateAsync(req.body);

        const { subject_name, user_id, term_id } = req.body;
        const subjectRepository = AppDataSource.getRepository(Subject);

        // Verificar si ya existe
        const existingSubject = await subjectRepository.findOne({ where: { subject_name } });
        if (existingSubject) {
            return res.status(400).json({ message: "La asignatura ya existe" });
        }

        const newSubject = subjectRepository.create({
            subject_name,
            user_id,
            term_id
        });

        await subjectRepository.save(newSubject);
        res.status(201).json(newSubject);
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ message: error.details[0].message });
        }
        console.error("Error al crear asignatura:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/subjects/:id
// Actualiza una asignatura existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Validar datos de entrada
        await updateSubjectValidation.validateAsync(req.body);

        const { subject_name, user_id, term_id } = req.body;
        const subjectRepository = AppDataSource.getRepository(Subject);
        const subject = await subjectRepository.findOne({ where: { subject_id: parseInt(id) } });

        if (!subject) {
            return res.status(404).json({ message: "Asignatura no encontrada" });
        }

        if (subject_name) subject.subject_name = subject_name;
        if (user_id) subject.user_id = user_id;
        if (term_id) subject.term_id = term_id;

        await subjectRepository.save(subject);
        res.json(subject);
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ message: error.details[0].message });
        }
        console.error("Error al actualizar asignatura:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE /api/subjects/:id
// Elimina una asignatura existente
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const subjectRepository = AppDataSource.getRepository(Subject);
        const subject = await subjectRepository.findOne({ where: { subject_id: parseInt(id) } });

        if (!subject) {
            return res.status(404).json({ message: "Asignatura no encontrada" });
        }

        await subjectRepository.remove(subject);
        res.json({ message: "Asignatura eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar asignatura:", error);
        // Check for foreign key violation (Postgres error code 23503)
        if (error.code === '23503') {
            return res.status(400).json({ message: "No se puede eliminar la asignatura. Asegúrese de que los temas no estén asociados a comisiones o pautas." });
        }
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default router;
