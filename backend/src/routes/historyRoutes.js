import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Student_Subject } from '../models/studentsubject.js';
import { Subject } from '../models/subject.js';
import { Evaluation_detail } from '../models/evaluationdetails.js';
import { Commission } from '../models/commission.js';
import { Theme } from '../models/theme.js';
import { score_detail } from '../models/scoredetail.js';
import { Criterion } from '../models/criterion.js';

const router = express.Router();

// GET /api/history/subjects/:userId
// Obtiene todas las asignaturas cursadas por un estudiante (histórico completo, sin filtro de status)
router.get('/subjects/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const studentSubjectRepo = AppDataSource.getRepository(Student_Subject);

        // JOIN Student_Subject con Subject, SIN filtro de status, ordenado por semestre DESC
        const subjects = await studentSubjectRepo
            .createQueryBuilder("student_subject")
            .innerJoin("subject", "s", "s.subject_id = student_subject.subject_id")
            .select([
                "student_subject.student_subject_id",
                "student_subject.subject_id",
                "s.subject_name",
                "student_subject.semester"
            ])
            .where("student_subject.user_id = :userId", { userId })
            .orderBy("student_subject.semester", "DESC")
            .getRawMany();

        // Mapear los resultados
        const mappedSubjects = subjects.map(s => ({
            student_subject_id: s.student_subject_student_subject_id,
            subject_id: s.student_subject_subject_id,
            subject_name: s.s_subject_name,
            semester: s.student_subject_semester
        }));

        res.json(mappedSubjects);
    } catch (error) {
        console.error("Error al obtener historial de asignaturas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// GET /api/history/evaluations/:userId/:subjectId/:semester
// Obtiene las evaluaciones de una asignatura específica en un semestre
router.get('/evaluations/:userId/:subjectId/:semester', async (req, res) => {
    const { userId, subjectId, semester } = req.params;

    try {
        const evalRepo = AppDataSource.getRepository(Evaluation_detail);

        // Buscar evaluaciones del estudiante para esa asignatura/semestre
        // JOIN: Evaluation_detail -> Commission -> Theme -> Subject
        const evaluations = await evalRepo
            .createQueryBuilder("ed")
            .innerJoin("commission", "c", "c.commission_id = ed.commission_id")
            .innerJoin("theme", "t", "t.theme_id = c.theme_id")
            .innerJoin("student_subject", "ss", "ss.subject_id = t.subject_id AND ss.user_id = ed.user_id")
            .select([
                "ed.evaluation_detail_id",
                "ed.grade",
                "c.commission_name",
                "c.date",
                "t.theme_name"
            ])
            .where("ed.user_id = :userId", { userId })
            .andWhere("t.subject_id = :subjectId", { subjectId })
            .andWhere("ss.semester = :semester", { semester })
            .orderBy("c.date", "DESC")
            .getRawMany();

        const mappedEvaluations = evaluations.map(e => ({
            evaluation_detail_id: e.ed_evaluation_detail_id,
            commission_name: e.c_comission_name,
            date: e.c_date,
            grade: e.ed_grade,
            theme_name: e.t_theme_name
        }));

        res.json(mappedEvaluations);
    } catch (error) {
        console.error("Error al obtener evaluaciones:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// GET /api/history/detail/:evaluationDetailId
// Obtiene el detalle completo de una evaluación con el desglose de la pauta
router.get('/detail/:evaluationDetailId', async (req, res) => {
    const { evaluationDetailId } = req.params;

    try {
        const evalRepo = AppDataSource.getRepository(Evaluation_detail);

        // Obtener los datos básicos de la evaluación
        const evaluation = await evalRepo.findOne({
            where: { evaluation_detail_id: parseInt(evaluationDetailId) }
        });

        if (!evaluation) {
            return res.status(404).json({ message: "Evaluación no encontrada" });
        }

        // Obtener los detalles de la pauta (Score_detail JOIN Criterion)
        const scoreRepo = AppDataSource.getRepository(score_detail);
        const scores = await scoreRepo
            .createQueryBuilder("sd")
            .innerJoin("criterion", "c", "c.criterion_id = sd.criterion_id")
            .select([
                "sd.score_id",
                "sd.actual_score",
                "c.criterion_id",
                "c.description",
                "c.scor_max"
            ])
            .where("sd.evaluation_detail_id = :evalId", { evalId: evaluationDetailId })
            .getRawMany();

        const mappedScores = scores.map(s => ({
            criterion_id: s.c_criterion_id,
            description: s.c_description,
            actual_score: s.sd_actual_score,
            max_score: s.c_scor_max
        }));

        const result = {
            evaluation_detail_id: evaluation.evaluation_detail_id,
            grade: evaluation.grade,
            observation: evaluation.observation,
            scores: mappedScores
        };

        res.json(result);
    } catch (error) {
        console.error("Error al obtener detalle de evaluación:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// GET /api/history/recent/:userId
// Obtiene las últimas 2 evaluaciones de un estudiante para mostrar en el dashboard
router.get('/recent/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const evalRepo = AppDataSource.getRepository(Evaluation_detail);

        const recentEvaluations = await evalRepo
            .createQueryBuilder("ed")
            .innerJoin("commission", "c", "c.commission_id = ed.commission_id")
            .innerJoin("theme", "t", "t.theme_id = c.theme_id")
            .innerJoin("subject", "s", "s.subject_id = t.subject_id")
            .select([
                "ed.evaluation_detail_id",
                "ed.grade",
                "s.subject_name",
                "c.date"
            ])
            .where("ed.user_id = :userId", { userId })
            .orderBy("c.date", "DESC")
            .limit(2)
            .getRawMany();

        const mappedEvaluations = recentEvaluations.map(e => ({
            evaluation_detail_id: e.ed_evaluation_detail_id,
            subject_name: e.s_subject_name,
            date: e.c_date,
            grade: e.ed_grade
        }));

        res.json(mappedEvaluations);
    } catch (error) {
        console.error("Error al obtener evaluaciones recientes:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default router;
