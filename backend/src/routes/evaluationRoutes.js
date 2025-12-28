import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Evaluation_detail } from '../models/evaluationdetails.js';
import { score_detail } from '../models/scoredetail.js';
import { User } from '../models/User.js';
import { Criterion } from '../models/criterion.js';
import { createEvaluationValidation, updateEvaluationValidation } from '../validations/evaluationValidation.js';

const router = express.Router();

/**
 * GET /api/evaluation-details/by-commission/:commissionId
 * Obtiene los resultados de evaluación de todos los estudiantes de una comisión
 */
router.get('/by-commission/:commissionId', async (req, res) => {
  try {
    const { commissionId } = req.params;
    const evaluationRepository = AppDataSource.getRepository(Evaluation_detail);
    const scoreDetailRepository = AppDataSource.getRepository(score_detail);
    const userRepository = AppDataSource.getRepository(User);
    
    // Obtener todas las evaluaciones de esta comisión
    const evaluations = await evaluationRepository
      .createQueryBuilder('ed')
      .where('ed.commission_id = :commissionId', { commissionId })
      .leftJoinAndSelect('ed.guidline', 'guidline')
      .getMany();
    
    // Para cada evaluación, obtener los datos del estudiante y sus puntajes
    const results = await Promise.all(evaluations.map(async (evaluation) => {
      // Obtener datos del estudiante
      const student = await userRepository.findOne({
        where: { user_id: evaluation.user_id },
        select: ['user_id', 'user_name', 'rut']
      });
      
      // Obtener los score_details de esta evaluación
      const scores = await scoreDetailRepository
        .createQueryBuilder('sd')
        .where('sd.evaluation_detail_id = :evalId', { evalId: evaluation.evaluation_detail_id })
        .leftJoinAndSelect('sd.criterion', 'criterion')
        .getMany();
      
      return {
        evaluation_detail_id: evaluation.evaluation_detail_id,
        student: student ? {
          user_id: student.user_id,
          user_name: student.user_name,
          rut: student.rut
        } : null,
        grade: evaluation.grade,
        observation: evaluation.observation,
        question_asked: evaluation.question_asked,
        status: evaluation.status,
        scores: scores.map(s => ({
          criterion_id: s.criterion_id,
          criterion_name: s.criterion?.description || 'Sin nombre',
          max_score: s.criterion?.scor_max || 0,
          actual_score: s.actual_score
        }))
      };
    }));
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching commission results:', error);
    res.status(500).json({ error: 'Error al obtener resultados de la comisión' });
  }
});

/**
 * GET /api/evaluation-details/pending
 * Obtiene todas las evaluaciones pendientes con datos relacionados
 * Incluye: usuario, comisión, tema y pauta con criterios
 */
router.get('/pending', async (req, res) => {
  try {
    const { userId } = req.query;
    const evaluationRepository = AppDataSource.getRepository(Evaluation_detail);
    
    const query = evaluationRepository
      .createQueryBuilder('ed')
      .where("ed.status = :status", { status: 'pending' })
      .leftJoinAndSelect('ed.guidline', 'guidline')
      .leftJoinAndSelect('guidline.theme', 'theme');
    
    // Si se proporciona userId, filtrar por ese profesor
    if (userId) {
      query.andWhere('ed.user_id = :userId', { userId });
    }
    
    const evaluations = await query
      .orderBy('ed.created_at', 'DESC')
      .getMany();
    
    // Enriquecer datos: agregar información de usuario y comisión
    const enrichedEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        // Traer datos del usuario (estudiante)
        const userRepository = AppDataSource.getRepository('user');
        const user = await userRepository.findOne({ where: { user_id: evaluation.user_id } });
        
        // Traer datos de la comisión
        const commissionRepository = AppDataSource.getRepository('commission');
        const commission = await commissionRepository.findOne({ where: { commission_id: evaluation.commission_id } });
        
        // Traer criterios de la pauta si existe
        let criteria = [];
        if (evaluation.guidline) {
          const criterionRepository = AppDataSource.getRepository('criterion');
          criteria = await criterionRepository.find({ where: { guidline_id: evaluation.guidline_id } });
        }

        // Traer score_details existentes para esta evaluación
        const scoreRepository = AppDataSource.getRepository(score_detail);
        const existingScores = await scoreRepository.find({ 
          where: { evaluation_detail_id: evaluation.evaluation_detail_id } 
        });
        
        return {
          ...evaluation,
          user: user || { user_id: evaluation.user_id, full_name: 'Desconocido' },
          commission: commission || { commission_id: evaluation.commission_id, commission_name: 'Desconocida' },
          criteria: criteria,
          scores: existingScores
        };
      })
    );
    
    res.json(enrichedEvaluations);
  } catch (error) {
    console.error('Error fetching pending evaluations:', error);
    res.status(500).json({ error: 'Error al obtener evaluaciones pendientes' });
  }
});

/**
 * POST /api/evaluation-details
 * Crea una nueva evaluación
 */
router.post('/', async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = await createEvaluationValidation.validateAsync(req.body, { abortEarly: false }).then(
      value => ({ error: null, value }),
      error => ({ error, value: null })
    );
    
    if (error) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const evaluationRepository = AppDataSource.getRepository(Evaluation_detail);
    
    // Verificar si ya existe una evaluación pendiente para esta comisión, usuario y pauta
    const existingEvaluation = await evaluationRepository.findOne({
      where: {
        user_id: value.user_id,
        commission_id: value.commission_id,
        guidline_id: value.guidline_id,
        status: 'pending'
      }
    });

    if (existingEvaluation) {
      // Si ya existe, retornarla en lugar de crear una nueva
      return res.status(200).json(existingEvaluation);
    }

    // Crear nueva evaluación
    const newEvaluation = evaluationRepository.create({
      user_id: value.user_id,
      commission_id: value.commission_id,
      guidline_id: value.guidline_id,
      observation: value.observation || null,
      question_asked: value.question_asked || null,
      grade: value.grade || null,
      status: value.status || 'pending'
    });

    const saved = await evaluationRepository.save(newEvaluation);
    
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating evaluation:', error);
    res.status(500).json({ error: 'Error al crear evaluación' });
  }
});

/**
 * GET /api/evaluation-details/:id
 * Obtiene una evaluación por ID con datos relacionados
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const evaluationRepository = AppDataSource.getRepository(Evaluation_detail);
    
    const evaluation = await evaluationRepository
      .createQueryBuilder('ed')
      .where('ed.evaluation_detail_id = :id', { id })
      .leftJoinAndSelect('ed.guidline', 'guidline')
      .leftJoinAndSelect('guidline.theme', 'theme')
      .getOne();
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    res.status(500).json({ error: 'Error al obtener evaluación' });
  }
});

/**
 * PUT /api/evaluation-details/:id
 * Actualiza una evaluación (grade, observation, status)
 */
router.put('/:id', async (req, res) => {
  try {
    // Validar datos de entrada (usar validateAsync por las reglas externas)
    const { error, value } = await updateEvaluationValidation.validateAsync(req.body, { abortEarly: false }).then(
      value => ({ error: null, value }),
      error => ({ error, value: null })
    );
    
    if (error) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { id } = req.params;
    const evaluationRepository = AppDataSource.getRepository(Evaluation_detail);
    
    const evaluation = await evaluationRepository.findOne({
      where: { evaluation_detail_id: id }
    });
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }
    
    // Actualizar campos proporcionados
    if (value.grade !== undefined) evaluation.grade = value.grade;
    if (value.observation !== undefined) evaluation.observation = value.observation;
    if (value.status !== undefined) evaluation.status = value.status;
    if (value.question_asked !== undefined) evaluation.question_asked = value.question_asked;
    if (value.user_id !== undefined) evaluation.user_id = value.user_id;
    if (value.commission_id !== undefined) evaluation.commission_id = value.commission_id;
    if (value.guidline_id !== undefined) evaluation.guidline_id = value.guidline_id;
    
    const updated = await evaluationRepository.save(evaluation);

    // Guardar los score_details si se proporcionan
    if (value.scores && Array.isArray(value.scores) && value.scores.length > 0) {
      const scoreRepository = AppDataSource.getRepository(score_detail);
      
      // Eliminar scores anteriores para esta evaluación
      await scoreRepository
        .createQueryBuilder()
        .delete()
        .where('evaluation_detail_id = :evalId', { evalId: id })
        .execute();
      
      // Crear nuevos scores
      const scoresToSave = value.scores.map(score => ({
        criterion_id: score.criterion_id,
        actual_score: score.actual_score,
        evaluation_detail_id: parseInt(id)
      }));
      
      await scoreRepository.save(scoresToSave);
      console.log('Scores guardados:', scoresToSave);
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating evaluation:', error);
    res.status(500).json({ error: 'Error al actualizar evaluación' });
  }
});

/**
 * GET /api/evaluation-details
 * Obtiene todas las evaluaciones (con filtros opcionales)
 */
router.get('/', async (req, res) => {
  try {
    const { status, userId } = req.query;
    const evaluationRepository = AppDataSource.getRepository(Evaluation_detail);
    
    let query = evaluationRepository
      .createQueryBuilder('ed')
      .leftJoinAndSelect('ed.guidline', 'guidline')
      .leftJoinAndSelect('guidline.theme', 'theme');
    
    if (status) {
      query = query.where('ed.status = :status', { status });
    }
    
    if (userId) {
      query = query.andWhere('ed.user_id = :userId', { userId });
    }
    
    const evaluations = await query.orderBy('ed.created_at', 'DESC').getMany();
    
    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ error: 'Error al obtener evaluaciones' });
  }
});

export default router;
