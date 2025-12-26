import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Subject } from '../models/subject.js';
import { Student_Subject } from '../models/studentsubject.js';

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
            .where("ss.user_id = :userId", { userId })
            .andWhere("ss.status = :status", { status: 'active' })
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
            where: { user_id: parseInt(userId) }
        });

        res.json(subjects);
    } catch (error) {
        console.error("Error al obtener asignaturas por usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default router;
