import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubjectsByUser } from '../services/subjectService';
import { getThemesBySubject, createTheme, updateTheme, deleteTheme } from '../services/themeService';
import { getQuestionsByTheme, createQuestion, updateQuestion, deleteQuestion } from '../services/questionService';

// Interfaces matching backend/services roughly, or keeping local for now if migrating
interface Pregunta {
    id: number;
    texto: string;
    respuestaEsperada: string;
    fechaCreacion: string;
    fechaModificacion?: string;
    dificultad: string;
}

interface LocalTheme {
    id: number;
    nombre: string;
    asignatura: string;
    preguntas: Pregunta[];
    guardado: boolean;
}


import { useAuth } from '../hooks/useAuth';

export default function SubjectThemeManager() {
    const { subjectId } = useParams<{ subjectId: string }>();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const [subjectName, setSubjectName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Estado del tema actual
    const [temaActual, setTemaActual] = useState<LocalTheme>({
        id: 0,
        nombre: '',
        asignatura: '',
        preguntas: [],
        guardado: false,
    });

    // Estado para temas existentes
    const [temasExistentes, setTemasExistentes] = useState<LocalTheme[]>([]);

    // Estado para nueva pregunta
    const [nuevaPregunta, setNuevaPregunta] = useState({
        texto: '',
        respuestaEsperada: '',
        dificultad: 'easy',
    });

    // Estado para edición de pregunta
    const [editandoPregunta, setEditandoPregunta] = useState<number | null>(null);
    const [preguntaEditada, setPreguntaEditada] = useState({
        texto: '',
        respuestaEsperada: '',
        dificultad: 'easy',
    });

    const ITEMS_PER_PAGE_OPTIONS = [
        { value: 5, label: '5' },
        { value: 10, label: '10' },
        { value: 15, label: '15' },
        { value: 20, label: '20' },
        { value: 50, label: '50' },
    ];

    // Estado para ver tema existente
    const [temaSeleccionado, setTemaSeleccionado] = useState<LocalTheme | null>(null);

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [difficultyFilter, setDifficultyFilter] = useState('all');

    useEffect(() => {
        const fetchSubjectDetails = async () => {
            if (authLoading) return;
            if (!subjectId || !user) return;

            try {
                // 1. Fetch Subject Info
                const userId = parseInt(user.id);
                const subjects = await getSubjectsByUser(userId);
                const currentSubject = subjects.find(s => s.subject_id === parseInt(subjectId));

                if (currentSubject) {
                    setSubjectName(currentSubject.subject_name);
                    setTemaActual(prev => ({ ...prev, asignatura: currentSubject.subject_name }));

                    // 2. Fetch Themes for this Subject
                    const apiThemes = await getThemesBySubject(parseInt(subjectId));

                    // 3. Fetch Questions for each Theme (to get the count and data)
                    const themesWithQuestions = await Promise.all(apiThemes.map(async (theme) => {
                        const questions = await getQuestionsByTheme(theme.theme_id);

                        // Map API Question to Local Pregunta Interface
                        const mappedQuestions: Pregunta[] = questions.map(q => ({
                            id: q.id_question,
                            texto: q.question_text,
                            respuestaEsperada: q.answer,
                            fechaCreacion: q.created_at ? new Date(q.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                            fechaModificacion: q.updated_at ? new Date(q.updated_at).toISOString().split('T')[0] : undefined,
                            dificultad: q.difficulty || 'easy'
                        }));

                        return {
                            id: theme.theme_id,
                            nombre: theme.theme_name,
                            asignatura: currentSubject.subject_name,
                            preguntas: mappedQuestions,
                            guardado: true
                        };
                    }));

                    setTemasExistentes(themesWithQuestions);
                } else {
                    console.error("Subject not found or access denied");
                    navigate('/gestion-asignaturas');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectDetails();
    }, [subjectId, navigate, user, authLoading]);

    // Estado para errores de validación
    const [errors, setErrors] = useState<string[]>([]);

    const handleGuardarTema = async () => {
        setErrors([]); // Limpiar errores previos
        const nombre = temaActual.nombre.trim();
        const newErrors: string[] = [];

        if (!nombre) {
            newErrors.push('El nombre del tema es obligatorio');
        } else {
            if (nombre.length > 300) {
                newErrors.push('El nombre del tema no puede exceder los 300 caracteres');
            }

            if (nombre.length < 2) {
                newErrors.push('El nombre del tema debe tener al menos 2 caracteres');
            }

            const validPattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/;
            if (!validPattern.test(nombre)) {
                newErrors.push('El nombre del tema solo puede contener letras, números, espacios, guiones y acentos');
            }
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (temaActual.guardado && temaActual.id !== 0) {
                // Update existing theme
                await updateTheme(temaActual.id, { theme_name: nombre });

                const themeUpdated = { ...temaActual, nombre: nombre };
                setTemasExistentes(temasExistentes.map(t => t.id === temaActual.id ? themeUpdated : t));
                setTemaActual(themeUpdated);
                alert("Tema actualizado correctamente");
            } else {
                // Create new theme
                const newTheme = await createTheme({
                    theme_name: nombre,
                    subject_id: parseInt(subjectId!)
                });

                const nuevoTemaLocal: LocalTheme = {
                    id: newTheme.theme_id,
                    nombre: newTheme.theme_name,
                    asignatura: subjectName,
                    preguntas: [],
                    guardado: true
                };

                setTemasExistentes([...temasExistentes, nuevoTemaLocal]);
                setTemaActual(nuevoTemaLocal);
                alert("Tema creado correctamente");
            }
        } catch (error: any) {
            console.error("Error saving theme:", error);
            if (error.response && error.response.status === 400 && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                const msg = error.response?.data?.message || "Error al guardar el tema";
                alert(msg);
            }
        }
    };

    const handleAgregarPregunta = async () => {
        setErrors([]);
        const { texto, respuestaEsperada, dificultad } = nuevaPregunta;
        const newErrors: string[] = [];

        if (!texto.trim()) newErrors.push('El texto de la pregunta es obligatorio');
        else if (texto.length < 5) newErrors.push('El texto de la pregunta debe tener al menos 5 caracteres');
        else if (texto.length > 500) newErrors.push('El texto de la pregunta no puede exceder los 500 caracteres');

        if (!respuestaEsperada.trim()) newErrors.push('La respuesta es obligatoria');
        else if (respuestaEsperada.length < 2) newErrors.push('La respuesta debe tener al menos 2 caracteres');
        else if (respuestaEsperada.length > 700) newErrors.push('La respuesta no puede exceder los 700 caracteres');

        if (!['easy', 'medium', 'hard'].includes(dificultad)) {
            newErrors.push('La dificultad debe ser facil, media o dificil');
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const questionData = {
                question_text: texto,
                answer: respuestaEsperada,
                theme_id: temaActual.id,
                user_id: user ? parseInt(user.id) : undefined,
                difficulty: dificultad
            };

            const savedQuestion = await createQuestion(questionData);

            const pregunta: Pregunta = {
                id: savedQuestion.id_question,
                texto: savedQuestion.question_text,
                respuestaEsperada: savedQuestion.answer,
                fechaCreacion: savedQuestion.created_at ? new Date(savedQuestion.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                dificultad: savedQuestion.difficulty || 'easy'
            };

            const temaActualizado = {
                ...temaActual,
                preguntas: [...temaActual.preguntas, pregunta],
            };

            setTemaActual(temaActualizado);

            // Si el tema está guardado (siempre debería estarlo si estamos agregando preguntas a él), actualizamos la lista global
            setTemasExistentes(temasExistentes.map(t =>
                t.id === temaActual.id ? temaActualizado : t
            ));

            setNuevaPregunta({ texto: '', respuestaEsperada: '', dificultad: 'easy' });
            alert("Pregunta agregada correctamente");
        } catch (error: any) {
            console.error("Error creating question:", error);
            if (error.response && error.response.status === 400 && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert("Error al agregar la pregunta");
            }
        }
    };

    const handleEliminarPregunta = async (preguntaId: number) => {
        if (!window.confirm('¿Está seguro de que desea eliminar esta pregunta?')) return;

        try {
            await deleteQuestion(preguntaId);

            const temaActualizado = {
                ...temaActual,
                preguntas: temaActual.preguntas.filter(p => p.id !== preguntaId),
            };

            setTemaActual(temaActualizado);

            if (temaActual.guardado) {
                setTemasExistentes(temasExistentes.map(t =>
                    t.id === temaActual.id ? temaActualizado : t
                ));
            }
            alert("Pregunta eliminada correctamente");
        } catch (error) {
            console.error("Error deleting question:", error);
            alert("Error al eliminar la pregunta");
        }
    };

    const handleIniciarEdicion = (pregunta: Pregunta) => {
        setErrors([]);
        setEditandoPregunta(pregunta.id);
        setPreguntaEditada({
            texto: pregunta.texto,
            respuestaEsperada: pregunta.respuestaEsperada,
            dificultad: pregunta.dificultad
        });
    };

    const handleGuardarEdicion = async (preguntaId: number) => {
        setErrors([]);
        const { texto, respuestaEsperada, dificultad } = preguntaEditada;
        const newErrors: string[] = [];

        if (!texto.trim()) newErrors.push('El texto de la pregunta es obligatorio');
        else if (texto.length < 5) newErrors.push('El texto de la pregunta debe tener al menos 5 caracteres');
        else if (texto.length > 500) newErrors.push('El texto de la pregunta no puede exceder los 500 caracteres');

        if (!respuestaEsperada.trim()) newErrors.push('La respuesta es obligatoria');
        else if (respuestaEsperada.length < 2) newErrors.push('La respuesta debe tener al menos 2 caracteres');
        else if (respuestaEsperada.length > 700) newErrors.push('La respuesta no puede exceder los 700 caracteres');

        if (!['easy', 'medium', 'hard'].includes(dificultad)) {
            newErrors.push('La dificultad debe ser facil, media o dificil');
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const questionData = {
                question_text: texto,
                answer: respuestaEsperada,
                theme_id: temaActual.id,
                difficulty: dificultad
            };

            await updateQuestion(preguntaId, questionData);

            const temaActualizado = {
                ...temaActual,
                preguntas: temaActual.preguntas.map(p =>
                    p.id === preguntaId
                        ? {
                            ...p,
                            texto: preguntaEditada.texto,
                            respuestaEsperada: preguntaEditada.respuestaEsperada,
                            dificultad: preguntaEditada.dificultad,
                            fechaModificacion: new Date().toISOString().split('T')[0]
                        }
                        : p
                ),
            };

            setTemaActual(temaActualizado);

            if (temaActual.guardado) {
                setTemasExistentes(temasExistentes.map(t =>
                    t.id === temaActual.id ? temaActualizado : t
                ));
            }

            setEditandoPregunta(null);
            setPreguntaEditada({ texto: '', respuestaEsperada: '', dificultad: 'easy' });
            alert("Pregunta actualizada correctamente");
        } catch (error: any) {
            console.error("Error updating question:", error);
            if (error.response && error.response.status === 400 && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert("Error al actualizar la pregunta");
            }
        }
    };

    const handleCancelarEdicion = () => {
        setErrors([]);
        setEditandoPregunta(null);
        setPreguntaEditada({ texto: '', respuestaEsperada: '', dificultad: 'easy' });
    };

    const handleSeleccionarTema = (tema: LocalTheme) => {
        setErrors([]);
        setTemaSeleccionado(tema);
        setTemaActual(tema);
    };

    const handleEliminarTema = async (temaId: number) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este tema?')) return;

        try {
            await deleteTheme(temaId);
            setTemasExistentes(temasExistentes.filter(t => t.id !== temaId));
            if (temaActual.id === temaId) {
                handleNuevoTema();
            }
        } catch (error) {
            console.error("Error deleting theme:", error);
            alert("Error al eliminar el tema.\nSe esta usando en una comision o en una pauta.");
        }
    };

    const handleNuevoTema = () => {
        setErrors([]);
        setTemaSeleccionado(null);
        setTemaActual({
            id: 0,
            nombre: '',
            asignatura: subjectName,
            preguntas: [],
            guardado: false,
        });
    };

    // Filter themes by subject name (using mock logic for now to match existing structure)
    // Since we fetch by subject ID, all themes in temasExistentes belong to this subject.
    // Filter themes by subject name (using mock logic for now to match existing structure)
    // Since we fetch by subject ID, all themes in temasExistentes belong to this subject.
    const temasDeAsignatura = temasExistentes;

    // Logic for pagination
    const filteredQuestions = temaActual.preguntas.filter(p =>
        difficultyFilter === 'all' ? true : p.dificultad === difficultyFilter
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    // Reset page when theme or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [temaActual.id, difficultyFilter]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />

            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/gestion-asignaturas')}
                        className="flex items-center text-gray-500 hover:text-[#003366] transition mb-4"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a Asignaturas
                    </button>

                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003366]">
                        <h1 className="text-2xl font-bold text-[#003366] mb-1">Gestión de Temas: {subjectName}</h1>
                        <p className="text-sm text-gray-500">
                            Administre los temas y el banco de preguntas para esta asignatura.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Sidebar - Temas Existentes */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-800">Temas</h3>
                                        <button
                                            onClick={handleNuevoTema}
                                            className="p-1.5 text-[#003366] hover:bg-blue-50 rounded-lg transition"
                                            title="Nuevo Tema"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                    {temasDeAsignatura.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500">
                                            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm">No hay temas creados</p>
                                        </div>
                                    ) : (
                                        temasDeAsignatura.map((tema) => (
                                            <div
                                                key={tema.id}
                                                className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition border-b border-gray-100 ${temaSeleccionado?.id === tema.id ? 'bg-blue-50 border-l-4 border-[#003366]' : ''}`}
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 text-sm">{tema.nombre}</h4>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                            {tema.preguntas.length} preguntas
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleSeleccionarTema(tema)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                                        title="Editar Tema"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminarTema(tema.id)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition"
                                                        title="Eliminar Tema"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Panel Principal */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Panel de Creación/Edición de Tema */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-[#003366] rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold text-[#003366]">
                                        {temaActual.guardado ? 'Editar Tema' : 'Crear Nuevo Tema'}
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Error Alert Box */}
                                    {errors.length > 0 && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-red-800">
                                                        Se encontraron errores:
                                                    </h3>
                                                    <div className="mt-2 text-sm text-red-700">
                                                        <ul className="list-disc pl-5 space-y-1">
                                                            {errors.map((error, index) => (
                                                                <li key={index}>{error}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Nombre del Tema <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={temaActual.nombre}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Strictly enforce limit in state
                                                if (val.length <= 300) {
                                                    setTemaActual({ ...temaActual, nombre: val });
                                                }
                                                // Clear errors when user types if they were validation errors about empty field
                                                if (errors.length > 0) setErrors([]);
                                            }}
                                            maxLength={300}
                                            className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                            placeholder="Ej: Cédula I - Bienes"
                                        />
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-xs ${temaActual.nombre.length >= 300 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                {temaActual.nombre.length}/300
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGuardarTema}
                                        disabled={!temaActual.nombre.trim()}
                                        className="inline-flex items-center px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Guardar
                                    </button>
                                </div>
                            </div>

                            {/* Módulo Banco de Preguntas (solo si el tema está guardado) */}
                            {temaActual.guardado && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-green-600 rounded-lg">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-[#003366]">Banco de Preguntas</h2>
                                                <p className="text-sm text-gray-500">Tema: {temaActual.nombre}</p>
                                            </div>
                                        </div>

                                        {/* Formulario de Ingreso Rápido */}
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                    Texto de la Pregunta <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={nuevaPregunta.texto}
                                                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, texto: e.target.value })}
                                                    maxLength={500}
                                                    className="block w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                                    placeholder="Escriba la pregunta..."
                                                />
                                                <div className="flex justify-end mt-1">
                                                    <span className={`text-xs ${nuevaPregunta.texto.length >= 500 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                        {nuevaPregunta.texto.length}/500
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                    Dificultad
                                                </label>
                                                <select
                                                    value={nuevaPregunta.dificultad}
                                                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, dificultad: e.target.value })}
                                                    className="block w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                                >
                                                    <option value="easy">Fácil</option>
                                                    <option value="medium">Media</option>
                                                    <option value="hard">Difícil</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                    Respuesta Esperada / Pauta de Corrección <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={nuevaPregunta.respuestaEsperada}
                                                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuestaEsperada: e.target.value })}
                                                    maxLength={700}
                                                    className="block w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition min-h-[80px] resize-y"
                                                    placeholder="Puntos clave de la respuesta esperada..."
                                                />
                                                <div className="flex justify-end mt-1">
                                                    <span className={`text-xs ${nuevaPregunta.respuestaEsperada.length >= 700 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                        {nuevaPregunta.respuestaEsperada.length}/700
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleAgregarPregunta}
                                                disabled={!nuevaPregunta.texto.trim() || !nuevaPregunta.respuestaEsperada.trim()}
                                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Agregar Pregunta
                                            </button>
                                        </div>
                                    </div>

                                    {/* Listado de Preguntas */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                            <h3 className="font-bold text-gray-800">Preguntas Agregadas</h3>

                                            <div className="flex items-center gap-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                                                    Total: {filteredQuestions.length}
                                                </span>

                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-500">Dificultad:</p>
                                                    <select
                                                        value={difficultyFilter}
                                                        onChange={(e) => setDifficultyFilter(e.target.value)}
                                                        className="w-auto text-center appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded-lg text-sm leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                                    >
                                                        <option value="all">Todas</option>
                                                        <option value="easy">Fácil</option>
                                                        <option value="medium">Media</option>
                                                        <option value="hard">Difícil</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-500">Mostrar</p>
                                                    <select
                                                        value={itemsPerPage}
                                                        onChange={handleLimitChange}
                                                        className="w-auto text-center appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded-lg text-sm leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                                    >
                                                        {ITEMS_PER_PAGE_OPTIONS.map(limit => (
                                                            <option key={limit.value} value={limit.value}>{limit.label}</option>
                                                        ))}
                                                    </select>
                                                    <p className="text-sm text-gray-500">preguntas</p>
                                                </div>
                                            </div>
                                        </div>

                                        {filteredQuestions.length === 0 ? (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-gray-500 font-medium">No hay preguntas que coincidan con el filtro</p>
                                                <p className="text-sm text-gray-400 mt-1">Use el formulario de arriba para agregar preguntas o cambie el filtro de dificultad</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-3 mb-6">
                                                    {currentItems.map((pregunta, index) => (
                                                        <div
                                                            key={pregunta.id}
                                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition bg-white"
                                                        >
                                                            {editandoPregunta === pregunta.id ? (
                                                                // Modo Edición
                                                                <div className="space-y-3">
                                                                    <input
                                                                        type="text"
                                                                        value={preguntaEditada.texto}
                                                                        onChange={(e) => setPreguntaEditada({ ...preguntaEditada, texto: e.target.value })}
                                                                        maxLength={500}
                                                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                                                    />
                                                                    <select
                                                                        value={preguntaEditada.dificultad}
                                                                        onChange={(e) => setPreguntaEditada({ ...preguntaEditada, dificultad: e.target.value })}
                                                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                                                    >
                                                                        <option value="easy">Fácil</option>
                                                                        <option value="medium">Media</option>
                                                                        <option value="hard">Difícil</option>
                                                                    </select>
                                                                    <textarea
                                                                        value={preguntaEditada.respuestaEsperada}
                                                                        onChange={(e) => setPreguntaEditada({ ...preguntaEditada, respuestaEsperada: e.target.value })}
                                                                        maxLength={700}
                                                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition min-h-[60px] resize-y"
                                                                    />
                                                                    <div className="flex justify-end gap-2 text-xs text-gray-400">
                                                                        <span>Texto: {preguntaEditada.texto.length}/500</span>
                                                                        <span>Respuesta: {preguntaEditada.respuestaEsperada.length}/700</span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleGuardarEdicion(pregunta.id)}
                                                                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium"
                                                                        >
                                                                            Guardar
                                                                        </button>
                                                                        <button
                                                                            onClick={handleCancelarEdicion}
                                                                            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs font-medium"
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // Modo Vista
                                                                <>
                                                                    <div className="flex items-start justify-between gap-4">
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#003366] text-white text-xs font-bold">
                                                                                    {indexOfFirstItem + index + 1}
                                                                                </span>
                                                                                <h4 className="font-semibold text-gray-800 text-sm">{pregunta.texto}</h4>
                                                                            </div>
                                                                            <div className="ml-8">
                                                                                <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded border-l-2 border-green-500">
                                                                                    {pregunta.respuestaEsperada}
                                                                                </p>
                                                                                <p className="text-xs text-gray-400 mt-2">
                                                                                    Agregada: {pregunta.fechaCreacion}
                                                                                    {pregunta.fechaModificacion && pregunta.fechaModificacion !== pregunta.fechaCreacion && (
                                                                                        <span className="ml-2 text-gray-400">| Modificada: {pregunta.fechaModificacion}</span>
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${pregunta.dificultad === 'easy' ? 'bg-green-100 text-green-800' :
                                                                                pregunta.dificultad === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    pregunta.dificultad === 'hard' ? 'bg-red-100 text-red-800' :
                                                                                        'bg-gray-100 text-gray-800'
                                                                                }`}>
                                                                                {
                                                                                    pregunta.dificultad === 'easy' ? 'Fácil' :
                                                                                        pregunta.dificultad === 'medium' ? 'Media' :
                                                                                            pregunta.dificultad === 'hard' ? 'Difícil' :
                                                                                                'Sin dificultad'
                                                                                }
                                                                            </span>
                                                                            <div className="flex gap-1">
                                                                                <button
                                                                                    onClick={() => handleIniciarEdicion(pregunta)}
                                                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                                                    title="Editar"
                                                                                >
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                                    </svg>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleEliminarPregunta(pregunta.id)}
                                                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                                                    title="Eliminar"
                                                                                >
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                    </svg>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Pagination Footer */}
                                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm text-gray-700">
                                                                Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredQuestions.length)}</span> de <span className="font-medium">{filteredQuestions.length}</span> resultados
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                                <button
                                                                    onClick={() => paginate(currentPage - 1)}
                                                                    disabled={currentPage === 1}
                                                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <span className="sr-only">Anterior</span>
                                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>

                                                                {/* Shows max 5 pages logic could go here, for now simpler full list or simple range */}
                                                                {[...Array(totalPages)].map((_, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => paginate(i + 1)}
                                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                                                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        {i + 1}
                                                                    </button>
                                                                ))}

                                                                <button
                                                                    onClick={() => paginate(currentPage + 1)}
                                                                    disabled={currentPage === totalPages}
                                                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <span className="sr-only">Siguiente</span>
                                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </nav>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <BottomNavigation />
        </div>
    );
}
