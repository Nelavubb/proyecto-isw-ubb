import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

// Estructura de datos para las preguntas (Mock Data)
interface Question {
    id: number;
    category: string;
    categoryColor: 'red' | 'blue' | 'yellow' | 'purple';
    question: string;
    excerpt: string;
    author: string;
    authorAvatar?: string;
    createdAt: string;
    modifiedAt: string;
}

const MOCK_QUESTIONS: Question[] = [
    {
        id: 1,
        category: 'Derecho Penal',
        categoryColor: 'red',
        question: '¿Qué es el dolo eventual en el contexto del derecho penal moderno?',
        excerpt: '"El sujeto se representa el resultado como posible y, aunque no lo desea directamente, lo acepta o le es indiferente, continuando con su acción."',
        author: 'Prof. Juan Pérez',
        createdAt: '10 oct 2023',
        modifiedAt: '12 oct 2023'
    },
    {
        id: 2,
        category: 'Derecho Civil',
        categoryColor: 'blue',
        question: 'Defina el concepto de hipoteca y sus características principales según el Código Civil.',
        excerpt: '"Derecho real de garantía que recae sobre bienes inmuebles y que no implica desposesión del deudor."',
        author: 'Prof. Ana Gomez',
        createdAt: '05 sep 2023',
        modifiedAt: '05 sep 2023'
    },
    {
        id: 3,
        category: 'Derecho Laboral',
        categoryColor: 'yellow',
        question: 'Explique los principios fundamentales del derecho laboral.',
        excerpt: '"Irrenunciabilidad, continuidad, primacía de la realidad, buena fe, razonabilidad y protector."',
        author: 'Prof. Roberto Diaz',
        createdAt: '20 ago 2023',
        modifiedAt: '22 ago 2023'
    },
    {
        id: 4,
        category: 'Constitucional',
        categoryColor: 'purple',
        question: '¿En qué consiste el Recurso de Amparo?',
        excerpt: '"Acción judicial que busca la protección de derechos constitucionales fundamentales frente a actos u omisiones que los vulneren."',
        author: 'Prof. Elena Ruiz',
        createdAt: '15 jul 2023',
        modifiedAt: '15 jul 2023'
    },
    {
        id: 5,
        category: 'Derecho Penal',
        categoryColor: 'red',
        question: 'Explique los requisitos para la legítima defensa.',
        excerpt: '"Agresión ilegítima, necesidad racional del medio empleado para impedirla o repelerla, y falta de provocación suficiente."',
        author: 'Prof. Juan Pérez',
        createdAt: '01 jun 2023',
        modifiedAt: '10 jun 2023'
    }
];

const QuestionBank = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Helper para clases de color
    const getCategoryStyles = (color: string) => {
        switch (color) {
            case 'red': return 'bg-red-50 text-red-600';
            case 'blue': return 'bg-blue-50 text-blue-600';
            case 'yellow': return 'bg-amber-50 text-amber-600'; // Amber es más legible que yellow
            case 'purple': return 'bg-purple-50 text-purple-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />
            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-7xl mx-auto">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between rounded-lg bg-white mb-8 gap-4 shadow-md p-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Banco de Preguntas</h1>
                            <p className="mt-1 text-gray-500">Gestione el repositorio de preguntas para las evaluaciones orales.</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/AddQuestion'}
                            className="inline-flex items-center px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar Pregunta
                        </button>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="relative flex-grow w-full md:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="Buscar en preguntas o respuestas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <div className="relative min-w-[200px]">
                                <button className="w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-between hover:bg-gray-50 text-sm">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        Todas las Asignaturas
                                    </span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="relative min-w-[180px]">
                                <button className="w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-between hover:bg-gray-50 text-sm">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Todos los Autores
                                    </span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Layout Container */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-2">Asignatura</div>
                            <div className="col-span-5">Pregunta y Respuesta</div>
                            <div className="col-span-2">Autor</div>
                            <div className="col-span-2">Fechas</div>
                            <div className="col-span-1 text-center">Acciones</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-gray-100">
                            {MOCK_QUESTIONS.map((q) => (
                                <div key={q.id} className="grid grid-cols-12 gap-4 p-6 items-start hover:bg-gray-50 transition-colors">

                                    {/* Asignatura */}
                                    <div className="col-span-2">
                                        <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${getCategoryStyles(q.categoryColor)}`}>
                                            {q.category}
                                        </span>
                                    </div>

                                    {/* Pregunta y Respuesta */}
                                    <div className="col-span-5 pr-4">
                                        <h3 className="text-base font-bold text-gray-900 mb-2">{q.question}</h3>
                                        <p className="text-gray-600 italic font-serif text-sm leading-relaxed">
                                            {q.excerpt}
                                        </p>
                                    </div>

                                    {/* Autor */}
                                    <div className="col-span-2">
                                        <p className="text-sm font-medium text-gray-700">{q.author}</p>
                                    </div>

                                    {/* Fechas */}
                                    <div className="col-span-2 space-y-1">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Creado: {q.createdAt}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Modif: {q.modifiedAt}</span>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="col-span-1 flex justify-center gap-2">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors" title="Editar">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button className="p-2 text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition-colors" title="Eliminar">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-500">
                            Mostrando <span className="font-medium">1-5</span> de <span className="font-medium">128</span> preguntas
                        </p>
                        <div className="flex gap-2">
                            <button className="p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="px-3 py-1 border border-[#003366] bg-[#003366] text-white rounded-md text-sm font-medium">1</button>
                            <button className="px-3 py-1 border border-gray-300 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">2</button>
                            <button className="px-3 py-1 border border-gray-300 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">3</button>
                            <span className="px-2 py-1 text-gray-500">...</span>
                            <button className="p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <BottomNavigation />
        </div>
    );
};

export default QuestionBank;
