import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Guidline } from '../models/guidline.js';
import { Criterion } from '../models/criterion.js';
import { score_detail } from '../models/scoredetail.js';
import { createGuidelineValidation, updateGuidelineValidation } from '../validations/guidelineValidation.js';
import { createCriterionValidation, updateCriterionValidation } from '../validations/criterionValidation.js';

const router = express.Router();

const guidelineRepository = () => AppDataSource.getRepository(Guidline);
const criterionRepository = () => AppDataSource.getRepository(Criterion);
const scoreDetailRepository = () => AppDataSource.getRepository(score_detail);

// Obtener todas las pautas
router.get('/', async (req, res) => {
    try {
        const guidelines = await guidelineRepository().find({
            relations: ['theme']
        });
        
        // Cargar criterios para cada pauta
        const guidelinesWithCriteria = await Promise.all(
            guidelines.map(async (guideline) => {
                const criteria = await criterionRepository().find({
                    where: { guidline_id: guideline.guidline_id }
                });
                return {
                    ...guideline,
                    description: criteria
                };
            })
        );
        
        res.json(guidelinesWithCriteria);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pautas', details: error.message });
    }
});

// Obtener una pauta por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const guideline = await guidelineRepository().findOne({
            where: { guidline_id: parseInt(id) },
            relations: ['theme']
        });
        
        if (!guideline) {
            return res.status(404).json({ error: 'Pauta no encontrada' });
        }
        
        // Cargar criterios asociados
        const criteria = await criterionRepository().find({
            where: { guidline_id: guideline.guidline_id }
        });
        
        guideline.description = criteria;
        
        res.json(guideline);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pauta', details: error.message });
    }
});

// Verificar si una pauta tiene evaluaciones asociadas (score_details)
router.get('/:id/has-evaluations', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener los criterios de esta pauta
        const criteria = await criterionRepository().find({
            where: { guidline_id: parseInt(id) }
        });
        
        if (!criteria || criteria.length === 0) {
            return res.json({ hasEvaluations: false, count: 0 });
        }
        
        // Contar score_details asociados a estos criterios
        let totalScoreDetails = 0;
        for (const criterion of criteria) {
            const count = await scoreDetailRepository().count({
                where: { criterion_id: criterion.criterion_id }
            });
            totalScoreDetails += count;
        }
        
        res.json({ 
            hasEvaluations: totalScoreDetails > 0, 
            count: totalScoreDetails 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar evaluaciones', details: error.message });
    }
});

// Crear una nueva pauta con criterios
router.post('/', async (req, res) => {
    try {
        const { name, theme_id, description } = req.body;
        
        // Validar usando Joi
        const { error, value } = createGuidelineValidation.validate({
            name,
            theme_id
        });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Crear la pauta
        const guideline = guidelineRepository().create({
            name: value.name,
            theme_id: value.theme_id
        });
        
        const savedGuideline = await guidelineRepository().save(guideline);

        // Crear criterios asociados
        if (description && Array.isArray(description) && description.length > 0) {
            // Validar cada criterio
            const criteriaToSave = [];
            for (const criterion of description) {
                const { error: criterionError, value: criterionValue } = createCriterionValidation.validate({
                    description: criterion.description,
                    scor_max: criterion.scor_max,
                    guidline_id: savedGuideline.guidline_id
                });

                if (criterionError) {
                    return res.status(400).json({ error: criterionError.details[0].message });
                }

                criteriaToSave.push(criterionRepository().create({
                    description: criterionValue.description,
                    scor_max: criterionValue.scor_max,
                    guidline_id: criterionValue.guidline_id
                }));
            }
            
            await criterionRepository().save(criteriaToSave);
            savedGuideline.description = criteriaToSave;
        }

        res.status(201).json(savedGuideline);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear pauta', details: error.message });
    }
});

// Actualizar una pauta
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, theme_id, description } = req.body;
        
        // Validar usando Joi
        const { error, value } = updateGuidelineValidation.validate({
            name,
            theme_id
        });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        
        const guideline = await guidelineRepository().findOne({
            where: { guidline_id: parseInt(id) },
            relations: ['theme']
        });
        
        if (!guideline) {
            return res.status(404).json({ error: 'Pauta no encontrada' });
        }

        // Actualizar pauta
        if (value.name) guideline.name = value.name;
        if (value.theme_id) guideline.theme_id = value.theme_id;
        
        await guidelineRepository().save(guideline);

        // Actualizar criterios
        if (description && Array.isArray(description)) {
            // Obtener criterios antiguos
            const oldCriteria = await criterionRepository().find({
                where: { guidline_id: guideline.guidline_id }
            });
            
            if (oldCriteria && oldCriteria.length > 0) {
                // Primero eliminar los score_details relacionados con estos criterios
                for (const criterion of oldCriteria) {
                    await scoreDetailRepository().delete({ criterion_id: criterion.criterion_id });
                }
                // Ahora sí eliminar los criterios
                await criterionRepository().remove(oldCriteria);
            }

            // Crear nuevos criterios (sin validación Joi estricta para update)
            const criteriaToSave = [];
            for (const criterion of description) {
                // Validación básica
                if (!criterion.description || criterion.description.trim().length < 3) {
                    return res.status(400).json({ error: 'Cada criterio debe tener una descripción de al menos 3 caracteres' });
                }
                if (!criterion.scor_max || criterion.scor_max <= 0) {
                    return res.status(400).json({ error: 'Cada criterio debe tener un puntaje máximo positivo' });
                }

                criteriaToSave.push(criterionRepository().create({
                    description: criterion.description.trim(),
                    scor_max: criterion.scor_max,
                    guidline_id: guideline.guidline_id
                }));
            }
            
            await criterionRepository().save(criteriaToSave);
        }

        res.json(guideline);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar pauta', details: error.message });
    }
});

// Eliminar una pauta
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const guideline = await guidelineRepository().findOne({
            where: { guidline_id: parseInt(id) },
            relations: ['theme']
        });
        
        if (!guideline) {
            return res.status(404).json({ error: 'Pauta no encontrada' });
        }

        // Eliminar criterios asociados
        const criteria = await criterionRepository().find({
            where: { guidline_id: guideline.guidline_id }
        });
        
        if (criteria && criteria.length > 0) {
            await criterionRepository().remove(criteria);
        }

        await guidelineRepository().remove(guideline);

        res.json({ message: 'Pauta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar pauta', details: error.message });
    }
});

export default router;
