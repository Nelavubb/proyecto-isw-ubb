import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { getSubjectsByUser, Subject } from '../services/subjectService';
import { getThemesBySubject, Theme } from '../services/themeService';
import { createQuestion } from '../services/questionService';

export default function AddQuestion() {
    const navigate = useNavigate();

    // State for Data
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);

    // State for Selections
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [selectedThemeId, setSelectedThemeId] = useState<string>('');

    // State for Content
    const [enunciado, setEnunciado] = useState('');
    const [respuesta, setRespuesta] = useState('');

    // Fetch Subjects on Mount
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                // Using User ID 3 (Profesor) as confirmed by DB check
                const data = await getSubjectsByUser(3);
                setSubjects(data);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };
        fetchSubjects();
    }, []);

    // Handle Subject Change
    const handleSubjectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subjectId = e.target.value;
        setSelectedSubjectId(subjectId);
        setSelectedThemeId(''); // Reset theme when subject changes
        setThemes([]);

        if (subjectId) {
            try {
                const data = await getThemesBySubject(parseInt(subjectId));
                setThemes(data);
            } catch (error) {
                console.error("Error fetching themes:", error);
            }
        }
    };

    const handleCancel = () => {
        if (window.confirm("¿Está seguro que desea cancelar? Se perderán los datos de la pregunta.")) {
            navigate('/QuestionBank');
        }
    };

    const handleSave = async () => {
        if (!selectedSubjectId || !selectedThemeId || !enunciado || !respuesta) return;

        try {
            await createQuestion({
                question_text: enunciado,
                answer: respuesta,
                theme_id: parseInt(selectedThemeId),
                user_id: 3 // Default user ID as per current auth context
            });
            // Navigate back to bank or show success toast
            navigate('/QuestionBank');
        } catch (error) {
            console.error("Error creating question:", error);
            // Optionally set an error state here
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />

            {/* Main Container */}
            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Page Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#003366]">
                        <h1 className="text-2xl font-bold text-[#003366] mb-1">Agregar Pregunta</h1>
                        <p className="text-sm text-gray-500">
                            Complete los campos a continuación para ingresar una nueva pregunta al banco de evaluaciones.
                        </p>
                    </div>

                    {/* Datos de clasificación */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-bold text-[#003366] mb-6">Datos de clasificación</h2>

                        <div className="space-y-6">
                            {/* Subject Select */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Asignatura <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedSubjectId}
                                        onChange={handleSubjectChange}
                                        className="block w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                    >
                                        <option value="" disabled>Seleccione una asignatura...</option>
                                        {subjects.map(subject => (
                                            <option key={subject.subject_id} value={subject.subject_id}>
                                                {subject.subject_name}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Select (Dependent on Subject) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Tema Específico <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedThemeId}
                                        onChange={(e) => setSelectedThemeId(e.target.value)}
                                        disabled={!selectedSubjectId}
                                        className={`block w-full appearance-none border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition ${!selectedSubjectId ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-gray-50'}`}
                                    >
                                        <option value="" disabled>
                                            {!selectedSubjectId ? 'Primero seleccione una asignatura...' : 'Seleccione un tema...'}
                                        </option>
                                        {themes.map(theme => (
                                            <option key={theme.theme_id} value={theme.theme_id}>
                                                {theme.theme_name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido de la pregunta (Visible only when classification is complete) */}
                    {selectedSubjectId && selectedThemeId && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                            <div className="p-6">
                                <h2 className="text-lg font-bold text-[#003366] mb-6">Contenido de la pregunta</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Enunciado <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={enunciado}
                                            onChange={(e) => setEnunciado(e.target.value)}
                                            className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded-lg py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition min-h-[120px] resize-y"
                                            placeholder="Escriba el enunciado completo de la pregunta..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Respuesta Esperada / Rúbrica <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={respuesta}
                                            onChange={(e) => setRespuesta(e.target.value)}
                                            className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded-lg py-3 px-4 leading-tight focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition min-h-[120px] resize-y"
                                            placeholder="Puntos clave para la evaluación..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Metadata and Actions Footer */}
                            <div className="bg-gray-50 px-6 py-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full md:w-auto text-center sm:text-left">
                                    <div>
                                        <span className="text-xs font-bold text-gray-900 block">Creado por:</span>
                                        <span className="text-sm text-gray-600">Dr. Roberto Silva</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-900 block">Fecha de Creación:</span>
                                        <span className="text-sm text-gray-600 flex items-center justify-center sm:justify-start gap-1">
                                            23 de diciembre de 2025
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4 w-full md:w-auto">
                                    <button
                                        onClick={handleCancel}
                                        className="w-full md:w-auto px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium shadow-sm"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        disabled={!enunciado.trim() || !respuesta.trim()}
                                        className="w-full md:w-auto px-6 py-2.5 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        Guardar Pregunta
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            <BottomNavigation />
        </div>
    );
}
