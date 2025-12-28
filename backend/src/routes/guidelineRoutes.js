import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Guidline } from '../models/guidline.js';
import { Criterion } from '../models/criterion.js';
import { createGuidelineValidation, updateGuidelineValidation } from '../validations/guidelineValidation.js';
import { createCriterionValidation, updateCriterionValidation } from '../validations/criterionValidation.js';

const router = express.Router();

const guidelineRepository = () => AppDataSource.getRepository(Guidline);
const criterionRepository = () => AppDataSource.getRepository(Criterion);

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
            // Obtener criterios antiguos para eliminarlos
            const oldCriteria = await criterionRepository().find({
                where: { guidline_id: guideline.guidline_id }
            });
            
            if (oldCriteria && oldCriteria.length > 0) {
                await criterionRepository().remove(oldCriteria);
            }

            // Validar y crear nuevos criterios
            const criteriaToSave = [];
            for (const criterion of description) {
                const { error: criterionError, value: criterionValue } = updateCriterionValidation.validate({
                    description: criterion.description,
                    scor_max: criterion.scor_max,
                    guidline_id: criterion.guidline_id
                });

                if (criterionError) {
                    return res.status(400).json({ error: criterionError.details[0].message });
                }

                criteriaToSave.push(criterionRepository().create({
                    description: criterionValue.description,
                    scor_max: criterionValue.scor_max,
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
