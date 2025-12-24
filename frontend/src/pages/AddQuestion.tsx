import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';

export default function AddQuestion() {
    const navigate = useNavigate();

    // State handles for inputs (placeholders for now)
    const [asignatura, setAsignatura] = useState('');
    const [tema, setTema] = useState('');
    const [enunciado, setEnunciado] = useState('');
    const [respuesta, setRespuesta] = useState('');

    const handleSave = () => {
        // Logic to save the question would go here
        console.log('Guardando pregunta:', { asignatura, tema, enunciado, respuesta });
        // Navigate back to bank or show success toast
        navigate('/QuestionBank');
    };

    const handleCancel = () => {
        navigate('/QuestionBank');
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
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Asignatura <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={asignatura}
                                        onChange={(e) => setAsignatura(e.target.value)}
                                        className="block w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    >
                                        <option value="" disabled>Seleccione una asignatura...</option>
                                        <option value="Derecho Civil I">Derecho Civil I</option>
                                        <option value="Derecho Penal">Derecho Penal</option>
                                        <option value="Derecho Procesal">Derecho Procesal</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Tema Específico
                                </label>
                                <input
                                    type="text"
                                    value={tema}
                                    onChange={(e) => setTema(e.target.value)}
                                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    placeholder="Ej: Teoría del Delito"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contenido de la pregunta */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-bold text-[#003366] mb-6">Contenido de la pregunta</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Enunciado <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={enunciado}
                                    onChange={(e) => setEnunciado(e.target.value)}
                                    className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 min-h-[120px] resize-y"
                                    placeholder="Escriba el enunciado completo..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Respuesta Esperada / Rúbrica <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={respuesta}
                                    onChange={(e) => setRespuesta(e.target.value)}
                                    className="appearance-none block w-full bg-white text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 min-h-[120px] resize-y"
                                    placeholder="Puntos clave para la evaluación..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Info & Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-white border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs font-bold text-gray-900 block">Creado por:</span>
                                <span className="text-sm text-gray-600">Dr. Roberto Silva</span>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-900 block">Fecha de Creación:</span>
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    23 de diciembre de 2025
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-8 flex flex-col items-center justify-center space-y-4">
                            <div className="flex gap-4 w-full max-w-md justify-center">
                                <button
                                    onClick={handleCancel}
                                    className="w-full border border-gray-300 text-gray-700 hover:bg-white px-4 py-2 rounded-lg transition text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="w-full px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm"
                                >
                                    Guardar Pregunta
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                                Puede editar esta pregunta más tarde desde el banco.
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            <BottomNavigation />
        </div>
    );
}
