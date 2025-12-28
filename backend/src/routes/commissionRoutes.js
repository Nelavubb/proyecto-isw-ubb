import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Commission } from '../models/commission.js';
import { Evaluation_detail } from '../models/evaluationdetails.js';

const router = express.Router();

/**
 * GET /api/commissions
 * Obtiene todas las comisiones
 */
router.get('/', async (req, res) => {
    try {
        const { userId, themeId } = req.query;
        const commissionRepository = AppDataSource.getRepository(Commission);

        let query = commissionRepository.createQueryBuilder('commission');

        if (userId) {
            query = query.where('commission.user_id = :userId', { userId });
        }

        if (themeId) {
            query = query.andWhere('commission.theme_id = :themeId', { themeId });
        }

        const commissions = await query
            .leftJoinAndSelect('commission.theme', 'theme')
            .orderBy('commission.date', 'DESC')
            .getMany();

        // Enriquecer con estudiantes asignados
        const enrichedCommissions = await Promise.all(
            commissions.map(async (commission) => {
                const evaluationRepository = AppDataSource.getRepository('Evaluation_detail');
                const evaluations = await evaluationRepository
                    .createQueryBuilder('ed')
                    .where('ed.commission_id = :commissionId', { commissionId: commission.commission_id })
                    .getMany();

                const userRepository = AppDataSource.getRepository('user');
                const studentIds = evaluations.map(e => e.user_id);
                let students = [];

                if (studentIds.length > 0) {
                    students = await userRepository
                        .createQueryBuilder('user')
                        .where('user.user_id IN (:...studentIds)', { studentIds })
                        .select(['user.user_id', 'user.user_name', 'user.rut'])
                        .getMany();
                }

                return {
                    ...commission,
                    estudiantes: students,
                    totalEstudiantes: students.length
                };
            })
        );

        res.json(enrichedCommissions);
    } catch (error) {
        console.error('Error fetching commissions:', error);
        res.status(500).json({ error: 'Error al obtener comisiones' });
    }
});

/**
 * GET /api/commissions/:id
 * Obtiene una comisión por ID con sus estudiantes asignados
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const commissionRepository = AppDataSource.getRepository(Commission);

        const commission = await commissionRepository
            .createQueryBuilder('commission')
            .where('commission.commission_id = :id', { id })
            .leftJoinAndSelect('commission.theme', 'theme')
            .getOne();

        if (!commission) {
            return res.status(404).json({ error: 'Comisión no encontrada' });
        }

        // Obtener estudiantes asignados a esta comisión (desde evaluation_details)
        const evaluationRepository = AppDataSource.getRepository('Evaluation_detail');
        const evaluations = await evaluationRepository
            .createQueryBuilder('ed')
            .where('ed.commission_id = :commissionId', { commissionId: id })
            .getMany();

        // Obtener datos de los estudiantes
        const userRepository = AppDataSource.getRepository('user');
        const studentIds = evaluations.map(e => e.user_id);
        let students = [];
        
        if (studentIds.length > 0) {
            students = await userRepository
                .createQueryBuilder('user')
                .where('user.user_id IN (:...studentIds)', { studentIds })
                .select(['user.user_id', 'user.user_name', 'user.rut'])
                .getMany();
        }

        res.json({
            ...commission,
            estudiantes: students,
            evaluaciones: evaluations
        });
    } catch (error) {
        console.error('Error fetching commission:', error);
        res.status(500).json({ error: 'Error al obtener comisión' });
    }
});

/**
 * GET /api/commissions/by-theme/:themeId
 * Obtiene todas las comisiones de un tema específico
 */
router.get('/by-theme/:themeId', async (req, res) => {
    try {
        const { themeId } = req.params;
        const commissionRepository = AppDataSource.getRepository(Commission);

        const commissions = await commissionRepository
            .createQueryBuilder('commission')
            .where('commission.theme_id = :themeId', { themeId })
            .leftJoinAndSelect('commission.theme', 'theme')
            .orderBy('commission.date', 'ASC')
            .getMany();

        // Enriquecer con estudiantes asignados
        const enrichedCommissions = await Promise.all(
            commissions.map(async (commission) => {
                const evaluationRepository = AppDataSource.getRepository('Evaluation_detail');
                const evaluations = await evaluationRepository
                    .createQueryBuilder('ed')
                    .where('ed.commission_id = :commissionId', { commissionId: commission.commission_id })
                    .getMany();

                const userRepository = AppDataSource.getRepository('user');
                const studentIds = evaluations.map(e => e.user_id);
                let students = [];

                if (studentIds.length > 0) {
                    students = await userRepository
                        .createQueryBuilder('user')
                        .where('user.user_id IN (:...studentIds)', { studentIds })
                        .select(['user.user_id', 'user.user_name', 'user.rut'])
                        .getMany();
                }

                return {
                    ...commission,
                    estudiantes: students,
                    totalEstudiantes: students.length
                };
            })
        );

        res.json(enrichedCommissions);
    } catch (error) {
        console.error('Error fetching commissions by theme:', error);
        res.status(500).json({ error: 'Error al obtener comisiones del tema' });
    }
});

/**
 * POST /api/commissions
 * Crea una nueva comisión con estudiantes asignados
 */
router.post('/', async (req, res) => {
    // Usar transacción para evitar comisiones huérfanas si hay error
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
        const { 
            commission_name, 
            user_id,  // profesor
            theme_id, 
            guideline_id,
            date, 
            time, 
            location,
            evaluation_group, // identificador de grupo de evaluación
            estudiantes // array de user_ids de estudiantes
        } = req.body;

        console.log('Datos recibidos:', req.body);

        // Validaciones
        if (!commission_name || !user_id || !theme_id || !date || !time || !location || !evaluation_group) {
            await queryRunner.rollbackTransaction();
            return res.status(400).json({ 
                error: 'Faltan campos requeridos: commission_name, user_id, theme_id, date, time, location, evaluation_group' 
            });
        }

        // Crear la comisión
        const newCommission = queryRunner.manager.create(Commission, {
            commission_name,
            user_id,
            theme_id,
            date,
            time,
            location,
            evaluation_group
        });

        console.log('Intentando guardar comisión:', newCommission);
        const savedCommission = await queryRunner.manager.save(Commission, newCommission);
        console.log('Comisión guardada:', savedCommission);

        // Si hay estudiantes, crear los evaluation_details para cada uno
        if (estudiantes && estudiantes.length > 0) {
            for (const studentId of estudiantes) {
                const evaluationData = {
                    user_id: studentId,
                    commission_id: savedCommission.commission_id,
                    status: 'pending'
                };
                // Solo agregar guidline_id si existe
                if (guideline_id) {
                    evaluationData.guidline_id = guideline_id;
                }
                console.log('Creando evaluation_detail:', evaluationData);
                
                const evaluation = queryRunner.manager.create(Evaluation_detail, evaluationData);
                await queryRunner.manager.save(Evaluation_detail, evaluation);
            }
            console.log('Evaluation details creados');
        }

        // Confirmar transacción
        await queryRunner.commitTransaction();
        res.status(201).json(savedCommission);
    } catch (error) {
        // Revertir cambios si hay error
        await queryRunner.rollbackTransaction();
        console.error('Error creating commission:', error);
        res.status(500).json({ error: 'Error al crear comisión', details: error.message });
    } finally {
        await queryRunner.release();
    }
});

/**
 * PUT /api/commissions/:id
 * Actualiza una comisión existente y sus estudiantes
 */
router.put('/:id', async (req, res) => {
    // Usar transacción para evitar pérdida de datos si hay error
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
        const { id } = req.params;
        const { commission_name, date, time, location, estudiantes } = req.body;

        console.log('PUT /api/commissions/:id - ID recibido:', id, 'tipo:', typeof id);

        const commission = await queryRunner.manager.findOne(Commission, {
            where: { commission_id: parseInt(id) }
        });

        console.log('Comisión encontrada:', commission);

        if (!commission) {
            await queryRunner.rollbackTransaction();
            return res.status(404).json({ error: 'Comisión no encontrada', details: `No se encontró comisión con ID: ${id}` });
        }

        if (commission_name) commission.commission_name = commission_name;
        if (date) commission.date = date;
        if (time) commission.time = time;
        if (location) commission.location = location;

        const updatedCommission = await queryRunner.manager.save(Commission, commission);

        // Si se proporcionan estudiantes, actualizar los evaluation_details
        if (estudiantes && Array.isArray(estudiantes)) {
            // Eliminar los evaluation_details actuales de esta comisión
            await queryRunner.manager
                .createQueryBuilder()
                .delete()
                .from(Evaluation_detail)
                .where('commission_id = :commissionId', { commissionId: id })
                .execute();
            
            // Crear nuevos evaluation_details para los estudiantes
            for (const studentId of estudiantes) {
                const evaluationData = {
                    user_id: studentId,
                    commission_id: parseInt(id),
                    status: 'pending'
                };
                
                const evaluation = queryRunner.manager.create(Evaluation_detail, evaluationData);
                await queryRunner.manager.save(Evaluation_detail, evaluation);
            }
        }

        // Confirmar transacción
        await queryRunner.commitTransaction();
        res.json(updatedCommission);
    } catch (error) {
        // Revertir cambios si hay error
        await queryRunner.rollbackTransaction();
        console.error('Error updating commission:', error);
        res.status(500).json({ error: 'Error al actualizar comisión', details: error.message });
    } finally {
        await queryRunner.release();
    }
});

/**
 * DELETE /api/commissions/:id
 * Elimina una comisión y sus evaluaciones asociadas
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Primero eliminar las evaluaciones asociadas
        const evaluationRepository = AppDataSource.getRepository('Evaluation_detail');
        await evaluationRepository
            .createQueryBuilder()
            .delete()
            .where('commission_id = :id', { id })
            .execute();

        // Luego eliminar la comisión
        const commissionRepository = AppDataSource.getRepository(Commission);
        const result = await commissionRepository.delete(parseInt(id));

        if (result.affected === 0) {
            return res.status(404).json({ error: 'Comisión no encontrada' });
        }

        res.json({ message: 'Comisión eliminada correctamente' });
    } catch (error) {
        console.error('Error deleting commission:', error);
        res.status(500).json({ error: 'Error al eliminar comisión' });
    }
});

export default router;
