import express from 'express';
import { AppDataSource } from '../config/database.js';
import { Guidline } from '../models/guidline.js';
import { Criterion } from '../models/criterion.js';

const router = express.Router();

const guidelineRepository = () => AppDataSource.getRepository(Guidline);
const criterionRepository = () => AppDataSource.getRepository(Criterion);

// Obtener todas las pautas
router.get('/', async (req, res) => {
    try {
        const guidelines = await guidelineRepository().find({
            relations: ['theme', 'criteria']
        });
        res.json(guidelines);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pautas', details: error.message });
    }
});

// Obtener una pauta por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const guideline = await guidelineRepository().findOne({
            where: { id_guidline: parseInt(id) },
            relations: ['theme', 'criteria']
        });
        
        if (!guideline) {
            return res.status(404).json({ error: 'Pauta no encontrada' });
        }
        
        res.json(guideline);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pauta', details: error.message });
    }
});

// Crear una nueva pauta con criterios
router.post('/', async (req, res) => {
    try {
        const { name, theme_id, criteria } = req.body;
        
        // Validar campos requeridos
        if (!name || !theme_id) {
            return res.status(400).json({ error: 'Nombre y tema son obligatorios' });
        }

        // Crear la pauta
        const guideline = guidelineRepository().create({
            name,
            theme_id
        });
        
        const savedGuideline = await guidelineRepository().save(guideline);

        // Crear criterios asociados
        if (criteria && Array.isArray(criteria) && criteria.length > 0) {
            const criteriaToSave = criteria.map((criterion) => 
                criterionRepository().create({
                    description: criterion.description,
                    scor_max: criterion.scor_max,
                    guidline_id: savedGuideline.id_guidline
                })
            );
            
            await criterionRepository().save(criteriaToSave);
            savedGuideline.criteria = criteriaToSave;
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
        const { name, theme_id, criteria } = req.body;
        
        const guideline = await guidelineRepository().findOne({
            where: { id_guidline: parseInt(id) },
            relations: ['criteria']
        });
        
        if (!guideline) {
            return res.status(404).json({ error: 'Pauta no encontrada' });
        }

        // Actualizar pauta
        if (name) guideline.name = name;
        if (theme_id) guideline.theme_id = theme_id;
        
        await guidelineRepository().save(guideline);

        // Actualizar criterios
        if (criteria && Array.isArray(criteria)) {
            // Eliminar criterios antiguos
            if (guideline.criteria && guideline.criteria.length > 0) {
                await criterionRepository().remove(guideline.criteria);
            }

            // Crear nuevos criterios
            const criteriaToSave = criteria.map((criterion) =>
                criterionRepository().create({
                    description: criterion.description,
                    scor_max: criterion.scor_max,
                    guidline_id: guideline.id_guidline
                })
            );
            
            const savedCriteria = await criterionRepository().save(criteriaToSave);
            guideline.criteria = savedCriteria;
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
            where: { id_guidline: parseInt(id) },
            relations: ['criteria']
        });
        
        if (!guideline) {
            return res.status(404).json({ error: 'Pauta no encontrada' });
        }

        // Eliminar criterios asociados
        if (guideline.criteria && guideline.criteria.length > 0) {
            await criterionRepository().remove(guideline.criteria);
        }

        await guidelineRepository().remove(guideline);

        res.json({ message: 'Pauta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar pauta', details: error.message });
    }
});

export default router;
