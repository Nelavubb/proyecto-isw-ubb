import express from 'express';
import { AppDataSource } from '../config/database.js';
import { User } from '../models/User.js';
import { Commission } from '../models/commission.js';
import { Evaluation_detail } from '../models/evaluationdetails.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Obtiene las estadísticas generales del sistema para el dashboard del administrador
 */
router.get('/stats', async (req, res) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const commissionRepository = AppDataSource.getRepository(Commission);
        const evaluationRepository = AppDataSource.getRepository(Evaluation_detail);

        // Contar estudiantes activos (rol = 'Estudiante')
        const studentsCount = await userRepository
            .createQueryBuilder('user')
            .where("LOWER(user.role) = LOWER(:role)", { role: 'Estudiante' })
            .getCount();

        // Contar profesores (rol = 'Profesor')
        const teachersCount = await userRepository
            .createQueryBuilder('user')
            .where("LOWER(user.role) = LOWER(:role)", { role: 'Profesor' })
            .getCount();

        // Contar comisiones activas (comisiones con fecha >= hoy o con evaluaciones pendientes)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activeCommissionsCount = await commissionRepository
            .createQueryBuilder('commission')
            .where('commission.date >= :today', { today: today.toISOString().split('T')[0] })
            .getCount();

        // Contar evaluaciones de este mes
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const evaluationsThisMonth = await evaluationRepository
            .createQueryBuilder('ed')
            .where('ed.created_at >= :start', { start: startOfMonth })
            .andWhere('ed.created_at <= :end', { end: endOfMonth })
            .getCount();

        res.json({
            studentsCount,
            teachersCount,
            activeCommissionsCount,
            evaluationsThisMonth
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas', details: error.message });
    }
});

/**
 * GET /api/dashboard/recent-activity
 * Obtiene la actividad reciente del sistema (últimos 5 eventos)
 */
router.get('/recent-activity', async (req, res) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const commissionRepository = AppDataSource.getRepository(Commission);
        const evaluationRepository = AppDataSource.getRepository(Evaluation_detail);

        const activities = [];

        // Obtener las últimas 5 comisiones creadas
        const recentCommissions = await commissionRepository
            .createQueryBuilder('commission')
            .leftJoinAndSelect('commission.theme', 'theme')
            .orderBy('commission.commission_id', 'DESC')
            .take(5)
            .getMany();

        for (const commission of recentCommissions) {
            activities.push({
                id: `commission-${commission.commission_id}`,
                type: 'commission',
                title: `Nueva comisión creada: ${commission.commission_name}`,
                description: commission.theme?.theme_name || 'Sin tema asignado',
                date: commission.date,
                icon: 'calendar'
            });
        }

        // Obtener las últimas 5 evaluaciones completadas
        const recentEvaluations = await evaluationRepository
            .createQueryBuilder('ed')
            .where("ed.status = :status", { status: 'completed' })
            .leftJoinAndSelect('ed.commission', 'commission')
            .orderBy('ed.evaluation_detail_id', 'DESC')
            .take(5)
            .getMany();

        for (const evaluation of recentEvaluations) {
            // Obtener nombre del estudiante
            const student = await userRepository.findOne({
                where: { user_id: evaluation.user_id },
                select: ['user_name']
            });

            activities.push({
                id: `evaluation-${evaluation.evaluation_detail_id}`,
                type: 'evaluation',
                title: `Evaluación completada`,
                description: student?.user_name || 'Estudiante',
                date: evaluation.created_at || new Date().toISOString(),
                icon: 'check'
            });
        }

        // Obtener los últimos 5 usuarios registrados (profesores y estudiantes)
        const recentUsers = await userRepository
            .createQueryBuilder('user')
            .where("LOWER(user.role) IN (:...roles)", { roles: ['profesor', 'estudiante'] })
            .orderBy('user.user_id', 'DESC')
            .take(5)
            .getMany();

        for (const user of recentUsers) {
            activities.push({
                id: `user-${user.user_id}`,
                type: 'user',
                title: `Nuevo ${user.role.toLowerCase()} registrado: ${user.user_name}`,
                description: `RUT: ${user.rut}`,
                date: new Date().toISOString(), // Los usuarios no tienen created_at
                icon: 'user'
            });
        }

        // Ordenar por fecha (más recientes primero) y tomar solo los últimos 5
        const sortedActivities = activities
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 5);

        res.json(sortedActivities);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Error al obtener actividad reciente', details: error.message });
    }
});

export default router;
