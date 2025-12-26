import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { getAllQuestions, Question as QuestionModel } from "../services/questionService";
import { getCategories, Category } from "../services/categoryService";
import { Link } from 'react-router-dom';

// Interface for the UI display (combines backend data with UI-specific fields)
interface DisplayQuestion {
    id: number;
    category: string;
    categoryColor: string;
    question: string;
    excerpt: string;
    author: string;
    createdAt: string;
    modifiedAt: string;
}

const MOCK_LIMIT = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
];

const QuestionBank = () => {
    const [questions, setQuestions] = useState<DisplayQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [limitSelect, setLimit] = useState(5);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch categories first for mapping
                const categoriesData = await getCategories();
                setCategories(categoriesData);

                // Fetch questions with limit
                const questionsData = await getAllQuestions(limitSelect);

                // Map backend data to UI structure
                const mappedQuestions: DisplayQuestion[] = questionsData.map((q: QuestionModel) => {
                    const category = categoriesData.find(c => c.id_category === q.category_id);
                    // Determine color based on category ID (consistent cyclic coloring)
                    const colors = ['red', 'blue', 'yellow', 'purple', 'green', 'indigo', 'pink'];
                    // Use a safe fallback for ID if category is missing or id is 0
                    const colorIndex = q.category_id ? q.category_id % colors.length : 0;
                    const color = colors[colorIndex] || 'gray';

                    return {
                        id: q.id_question,
                        category: category ? category.name : 'General',
                        categoryColor: color,
                        question: q.question_text,
                        excerpt: q.answer, // Using answer as excerpt for now
                        author: 'Profesor', // Placeholder as backend might not return author name yet
                        createdAt: new Date().toLocaleDateString(), // Placeholder
                        modifiedAt: new Date().toLocaleDateString() // Placeholder
                    };
                });

                setQuestions(mappedQuestions);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [limitSelect]);

    // Helper for category color styles
    const getCategoryStyles = (color: string) => {
        switch (color) {
            case 'red': return 'bg-red-50 text-red-600';
            case 'blue': return 'bg-blue-50 text-blue-600';
            case 'yellow': return 'bg-amber-50 text-amber-600';
            case 'purple': return 'bg-purple-50 text-purple-600';
            case 'green': return 'bg-green-50 text-green-600';
            case 'indigo': return 'bg-indigo-50 text-indigo-600';
            case 'pink': return 'bg-pink-50 text-pink-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(parseInt(e.target.value));
    };

    // Filter logic
    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? q.category === selectedCategory : true;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />
            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-7xl mx-auto">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between rounded-lg bg-white mb-8 gap-4 shadow-md p-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Banco de Preguntas</h1>
                            <p className="mt-1 text-sm text-gray-500">Gestione el repositorio de preguntas para las evaluaciones orales.</p>
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

                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">
                                Mostrando
                            </p>

                            <select
                                value={limitSelect}
                                onChange={handleLimitChange}
                                className="w-auto text-center appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1 px-1 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                            >
                                {MOCK_LIMIT.map(limit => (
                                    <option key={limit.value} value={limit.value}>
                                        {limit.label}
                                    </option>
                                ))}
                            </select>

                            <p className="text-sm text-gray-500">
                                preguntas.
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                        {loading ? (
                            <div className="p-12 flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                                <span className="ml-3 text-gray-500">Cargando preguntas...</span>
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900">No se encontraron preguntas</h3>
                                <p className="text-gray-500 mt-1">Intente ajustar los filtros o agregue una nueva pregunta.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-[#003366]">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Asignatura
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/2">
                                                    Pregunta y Respuesta
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Autor
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Fechas
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredQuestions.map((q) => (
                                                <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryStyles(q.categoryColor)}`}>
                                                            {q.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 mb-1">{q.question}</div>
                                                        <div className="text-xs text-gray-500 line-clamp-2 italic">{q.excerpt}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                                {q.author.charAt(0)}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">{q.author}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                        <div>Creado: {q.createdAt}</div>
                                                        <div>Modif: {q.modifiedAt}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded border border-indigo-200 transition"
                                                                title="Editar Pregunta"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded border border-red-200 transition"
                                                                title="Eliminar Pregunta"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Mostrando {filteredQuestions.length} resultados
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <BottomNavigation />
        </div>
    );
};

export default QuestionBank;
