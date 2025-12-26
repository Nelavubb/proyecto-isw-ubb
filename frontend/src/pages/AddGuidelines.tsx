import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createGuideline, updateGuideline, getGuidelineById, Guideline, Criterion } from '../services/guidelineService';
import { getAllThemes, Theme } from '../services/themeService';

export default function AddGuidelines() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const guidelineId = searchParams.get('id');
    const themeId = searchParams.get('themeId');

    const [temas, setTemas] = useState<Theme[]>([]);
    const [temaSeleccionado, setTemaSeleccionado] = useState<Theme | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingTemas, setLoadingTemas] = useState(true);
    const [editingGuideline, setEditingGuideline] = useState<Guideline | null>(null);
    
    const [guidelineForm, setGuidelineForm] = useState({
        name: '',
        description: [{ description: '', scor_max: 0 }]
    });

    useEffect(() => {
        loadTemas();
        if (guidelineId) {
            loadGuideline();
        }
    }, [guidelineId]);

    useEffect(() => {
        if (themeId && temas.length > 0) {
            const tema = temas.find(t => t.theme_id === parseInt(themeId));
            if (tema) {
                setTemaSeleccionado(tema);
            }
        }
    }, [themeId, temas]);

    useEffect(() => {
        // Auto-generar nombre de pauta cuando se selecciona un tema
        if (temaSeleccionado && !editingGuideline && !guidelineForm.name) {
            const nombreAutogenera = `Pauta de ${temaSeleccionado.theme_name}`;
            setGuidelineForm(prev => ({ ...prev, name: nombreAutogenera }));
        }
    }, [temaSeleccionado, editingGuideline]);

    const loadTemas = async () => {
        try {
            setLoadingTemas(true);
            const data = await getAllThemes();
            setTemas(data);
        } catch (error) {
            console.error('Error al cargar temas:', error);
            alert('Error al cargar los temas de la base de datos');
        } finally {
            setLoadingTemas(false);
        }
    };

    const loadGuideline = async () => {
        try {
            setLoading(true);
            const data = await getGuidelineById(parseInt(guidelineId!));
            setEditingGuideline(data);
            setGuidelineForm({
                name: data.name,
                description: data.description || [{ description: '', scor_max: 0 }]
            });

            const tema = temas.find(t => t.theme_id === data.theme_id);
            if (tema) {
                setTemaSeleccionado(tema);
            }
        } catch (error) {
            console.error('Error al cargar pauta:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCriteria = () => {
        setGuidelineForm(prev => ({
            ...prev,
            description: [...prev.description, { description: '', scor_max: 0 }]
        }));
    };

    const handleRemoveCriteria = (index: number) => {
        setGuidelineForm(prev => ({
            ...prev,
            description: prev.description.filter((_, i) => i !== index)
        }));
    };

    const handleSaveGuideline = async () => {
        try {
            if (guidelineForm.description.some(c => !c.description || c.scor_max <= 0)) {
                alert('Por favor, completa todos los criterios con descripción y puntaje');
                return;
            }

            if (!temaSeleccionado) {
                alert('Por favor, selecciona un tema');
                return;
            }

            const payload = {
                name: guidelineForm.name,
                theme_id: temaSeleccionado.theme_id,
                description: guidelineForm.description
            };

            setLoading(true);

            if (editingGuideline) {
                await updateGuideline(editingGuideline.guidline_id!, payload);
                alert('Pauta actualizada exitosamente');
            } else {
                await createGuideline(payload);
                alert('Pauta creada exitosamente');
            }

            navigate('/comisiones');
        } catch (error) {
            console.error('Error al guardar pauta:', error);
            alert('Error al guardar la pauta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />

            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003366] mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-[#003366] mb-1">
                                    {editingGuideline ? 'Editar Pauta de Evaluación' : 'Crear Pauta de Evaluación'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Define los criterios de evaluación para la pauta
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/comisiones')}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Cargando...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                            {/* Tema */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Tema Asignado <span className="text-red-500">*</span>
                                </label>
                                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 flex items-center">
                                    {temaSeleccionado?.theme_name || 'Cargando tema...'}
                                </div>
                            </div>

                            {/* Nombre de la pauta */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre de la Pauta <span className="text-red-500">*</span>
                                </label>
                                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 flex items-center">
                                    {guidelineForm.name || 'Nombre de la pauta'}
                                </div>
                            </div>

                            {/* Criterios */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Criterios de Evaluación <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddCriteria}
                                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium"
                                    >
                                        + Agregar Criterio
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {guidelineForm.description.map((criterion, index) => (
                                        <div key={index} className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 gap-3 items-start">
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                                                            Criterio a evaluar
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={criterion.description}
                                                            onChange={(e) => {
                                                                const newCriteria = [...guidelineForm.description];
                                                                newCriteria[index].description = e.target.value;
                                                                setGuidelineForm(prev => ({ ...prev, description: newCriteria }));
                                                            }}
                                                            placeholder="Ej: Argumentación jurídica clara"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                                                            Puntaje Máximo
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={criterion.scor_max || ''}
                                                            onChange={(e) => {
                                                                const newCriteria = [...guidelineForm.description];
                                                                newCriteria[index].scor_max = parseFloat(e.target.value) || 0;
                                                                setGuidelineForm(prev => ({ ...prev, description: newCriteria }));
                                                            }}
                                                            placeholder="Ej: 20"
                                                            min="0"
                                                            step="0.5"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                                                        />
                                                    </div>
                                                </div>

                                                {guidelineForm.description.length > 1 && (
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCriteria(index)}
                                                            className="px-4 py-2 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-900">
                                        <span className="font-semibold">Total de criterios:</span> {guidelineForm.description.length}
                                    </p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        <span className="font-semibold">Puntaje total máximo:</span> {guidelineForm.description.reduce((sum, c) => sum + (c.scor_max || 0), 0)} puntos
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => navigate('/comisiones')}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveGuideline}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : editingGuideline ? 'Actualizar Pauta' : 'Crear Pauta'}
                        </button>
                    </div>
                </div>
            </main>

            <BottomNavigation />
        </div>
    );
}
