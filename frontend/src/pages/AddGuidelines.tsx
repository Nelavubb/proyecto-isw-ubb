import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createGuideline, updateGuideline, getGuidelineById, getGuidelines, Guideline, Criterion } from '../services/guidelineService';
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
    const [criterionCharCounts, setCriterionCharCounts] = useState<number[]>([0]);
    const [criterionErrors, setCriterionErrors] = useState<string[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; index: number; newScore: number }>({
        open: false,
        index: -1,
        newScore: 0
    });

    const CRITERION_MAX_CHARS = 500;
    const CRITERION_MIN_CHARS = 3;
    const SCORE_WARNING_THRESHOLD = 100;

    // Validar descripción del criterio
    const validateCriterionDescription = (text: string): string => {
        // Mínimo 3 caracteres
        if (text.length < CRITERION_MIN_CHARS) {
            return `Mínimo ${CRITERION_MIN_CHARS} caracteres requeridos`;
        }

        // Solo caracteres especiales
        if (!/[a-zA-Z0-9]/.test(text)) {
            return 'Debe contener al menos una letra o número';
        }

        // Solo combinación de letras y caracteres especiales (sin números)
        const hasLetters = /[a-zA-Z]/.test(text);
        const hasNumbers = /[0-9]/.test(text);
        const hasSpecialChars = /[^a-zA-Z0-9\s]/.test(text);

        // Si solo tiene letras y caracteres especiales (sin números), es válido
        // Si tiene solo números y caracteres especiales, es válido
        // Si tiene letras y números, es válido
        // Solo rechaza si tiene SOLO caracteres especiales (ya validado arriba)

        return ''; // Válido
    };

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
        setCriterionCharCounts(prev => [...prev, 0]);
        setCriterionErrors(prev => [...prev, '']);
    };

    const handleRemoveCriteria = (index: number) => {
        setGuidelineForm(prev => ({
            ...prev,
            description: prev.description.filter((_, i) => i !== index)
        }));
        setCriterionCharCounts(prev => prev.filter((_, i) => i !== index));
        setCriterionErrors(prev => prev.filter((_, i) => i !== index));
    };

    const handleCriterionDescriptionChange = (index: number, value: string) => {
        // Limitar a 500 caracteres
        if (value.length <= CRITERION_MAX_CHARS) {
            const newCriteria = [...guidelineForm.description];
            newCriteria[index].description = value;
            setGuidelineForm(prev => ({ ...prev, description: newCriteria }));

            const newCharCounts = [...criterionCharCounts];
            newCharCounts[index] = value.length;
            setCriterionCharCounts(newCharCounts);

            // Validar descripción
            const error = validateCriterionDescription(value);
            const newErrors = [...criterionErrors];
            if (error) {
                newErrors[index] = error;
            } else {
                newErrors[index] = '';
            }
            setCriterionErrors(newErrors);
        }
    };

    const handleScorMaxChange = (index: number, newScore: string) => {
        const scoreValue = parseFloat(newScore) || 0;

        // Si el puntaje es mayor que el umbral, mostrar confirmación
        if (scoreValue > SCORE_WARNING_THRESHOLD) {
            setConfirmDialog({
                open: true,
                index: index,
                newScore: scoreValue
            });
        } else {
            const newCriteria = [...guidelineForm.description];
            newCriteria[index].scor_max = scoreValue;
            setGuidelineForm(prev => ({ ...prev, description: newCriteria }));
        }
    };

    const handleConfirmScore = (confirm: boolean) => {
        if (confirm && confirmDialog.index !== -1) {
            const newCriteria = [...guidelineForm.description];
            newCriteria[confirmDialog.index].scor_max = confirmDialog.newScore;
            setGuidelineForm(prev => ({ ...prev, description: newCriteria }));
        }
        setConfirmDialog({ open: false, index: -1, newScore: 0 });
    };

    const handleSaveGuideline = async () => {
        try {
            // Validar que todos los criterios tengan descripción válida
            const hasErrors = criterionErrors.some(error => error !== '');
            if (hasErrors) {
                alert('Por favor, corrige los errores en los criterios antes de guardar');
                return;
            }

            if (guidelineForm.description.some(c => !c.description || c.scor_max <= 0)) {
                alert('Por favor, completa todos los criterios con descripción y puntaje');
                return;
            }

            if (!temaSeleccionado) {
                alert('Por favor, selecciona un tema');
                return;
            }

            // Validar que no existe otra pauta para este tema (solo si es creación nueva)
            if (!editingGuideline) {
                try {
                    const allGuidelines = await getGuidelines();
                    const existsGuidelineForTheme = allGuidelines.some(g => g.theme_id === temaSeleccionado.theme_id);
                    if (existsGuidelineForTheme) {
                        alert(`Ya existe una pauta asignada para el tema "${temaSeleccionado.theme_name}". Solo puede existir una pauta por tema.`);
                        return;
                    }
                } catch (error) {
                    console.error('Error al verificar pautas existentes:', error);
                }
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
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={criterion.description}
                                                                onChange={(e) => handleCriterionDescriptionChange(index, e.target.value)}
                                                                placeholder="Ej: Argumentación jurídica clara"
                                                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${criterionErrors[index]
                                                                        ? 'border-red-500 focus:ring-red-500'
                                                                        : 'border-gray-300 focus:ring-[#003366]'
                                                                    }`}
                                                                maxLength={CRITERION_MAX_CHARS}
                                                            />
                                                            <div className="absolute bottom-1 right-3 text-xs text-gray-500 font-medium">
                                                                {criterionCharCounts[index] || 0}/{CRITERION_MAX_CHARS}
                                                            </div>
                                                        </div>
                                                        {criterionErrors[index] && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {criterionErrors[index]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                                                            Puntaje Máximo
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={criterion.scor_max || ''}
                                                            onChange={(e) => handleScorMaxChange(index, e.target.value)}
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
                            onClick={() => navigate('/comisiones?step=crear')}
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

            {/* Modal de Confirmación para Puntaje Alto */}
            {confirmDialog.open && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                        onClick={() => handleConfirmScore(false)}
                    />

                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 z-10 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6v2m0-4v2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Puntaje elevado</h3>
                        </div>

                        <p className="text-gray-700 mb-6">
                            Estás asignando un puntaje máximo de <span className="font-bold text-lg">{confirmDialog.newScore}</span> puntos a este criterio.
                        </p>

                        <p className="text-sm text-gray-600 mb-6">
                            ¿Estás seguro de que quieres asignar este puntaje?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleConfirmScore(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleConfirmScore(true)}
                                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNavigation />
        </div>
    );
}
