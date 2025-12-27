import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Evaluation_detail } from '../models/evaluationdetails.js';

const router = express.Router();

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
      .where("ed.evaluation_status = :status", { status: 'pending' })
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
        
        return {
          ...evaluation,
          user: user || { user_id: evaluation.user_id, full_name: 'Desconocido' },
          commission: commission || { commission_id: evaluation.commission_id, commission_name: 'Desconocida' },
          criteria: criteria
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
 * Actualiza una evaluación (grade, observation, evaluation_status)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, observation, evaluation_status } = req.body;
    const evaluationRepository = AppDataSource.getRepository(Evaluation_detail);
    
    const evaluation = await evaluationRepository.findOne({
      where: { evaluation_detail_id: id }
    });
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }
    
    // Actualizar campos proporcionados
    if (grade !== undefined) evaluation.grade = grade;
    if (observation !== undefined) evaluation.observation = observation;
    if (evaluation_status !== undefined) evaluation.evaluation_status = evaluation_status;
    
    const updated = await evaluationRepository.save(evaluation);
    
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
      query = query.where('ed.evaluation_status = :status', { status });
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
