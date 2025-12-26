import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { getAllQuestions, Question as QuestionModel } from "../services/questionService";
import { getAllThemes, Theme } from "../services/themeService";
import { Link, useNavigate } from 'react-router-dom';

// Interface for the UI display (combines backend data with UI-specific fields)
interface DisplayQuestion {
    id: number;
    themeId: number;
    theme: string;
    themeColor: string;
    question: string;
    excerpt: string;
    author: string;
    createdAt: string;
    modifiedAt: string;
}

const ITEMS_PER_PAGE_OPTIONS = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
];

const QuestionBank = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<DisplayQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedThemeId, setSelectedThemeId] = useState<number | ''>('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch themes first for mapping
                const themesData = await getAllThemes();
                setThemes(themesData);

                // Fetch ALL questions for client-side pagination
                const questionsData = await getAllQuestions(10000);

                // Map backend data to UI structure
                const mappedQuestions: DisplayQuestion[] = questionsData.map((q: QuestionModel) => {
                    const theme = themesData.find(t => t.theme_id === q.theme_id);
                    // Determine color based on theme ID (consistent cyclic coloring)
                    const colors = ['red', 'blue', 'yellow', 'purple', 'green', 'indigo', 'pink'];
                    // Use a safe fallback for ID if theme is missing or id is 0
                    const colorIndex = q.theme_id ? q.theme_id % colors.length : 0;
                    const color = colors[colorIndex] || 'gray';

                    return {
                        id: q.id_question,
                        themeId: q.theme_id,
                        theme: theme ? theme.theme_name : 'General',
                        themeColor: color,
                        question: q.question_text,
                        excerpt: q.answer, // Using answer as excerpt for now
                        author: q.user?.user_name || 'Desconocido',
                        createdAt: q.created_at ? new Date(q.created_at).toLocaleDateString() : '-',
                        modifiedAt: q.updated_at ? new Date(q.updated_at).toLocaleDateString() : '-'
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
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedThemeId, itemsPerPage]);

    // Helper for category/theme color styles
    const getThemeStyles = (color: string) => {
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
        setItemsPerPage(parseInt(e.target.value));
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedThemeId(value === '' ? '' : parseInt(value));
        setCurrentPage(1);
    };

    // Filter logic
    const filteredQuestions = questions.filter(q => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch =
            q.question.toLowerCase().includes(lowerSearchTerm) ||
            q.theme.toLowerCase().includes(lowerSearchTerm) ||
            q.excerpt.toLowerCase().includes(lowerSearchTerm) ||
            q.author.toLowerCase().includes(lowerSearchTerm) ||
            q.createdAt.includes(searchTerm) ||
            q.modifiedAt.includes(searchTerm);

        const matchesTheme = selectedThemeId !== '' ? q.themeId === selectedThemeId : true;

        return matchesSearch && matchesTheme;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                                {/* Left Icon (Filter) */}
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                </div>

                                {/* The Native Select styled to look like the button */}
                                <select
                                    value={selectedThemeId}
                                    onChange={handleThemeChange}
                                    className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg py-2 pl-10 pr-10 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    style={{ paddingLeft: '2.5rem' }}
                                >
                                    <option value="">Todos los Temas</option>
                                    {themes.map((theme) => (
                                        <option key={theme.theme_id} value={theme.theme_id}>
                                            {theme.theme_name}
                                        </option>
                                    ))}
                                </select>

                                {/* Right Icon (Chevron) - Manually placed because we hid the default one */}
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
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
                                Mostrar
                            </p>

                            <select
                                value={itemsPerPage}
                                onChange={handleLimitChange}
                                className="w-auto text-center appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1 px-1 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                            >
                                {ITEMS_PER_PAGE_OPTIONS.map(limit => (
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
                                                    Tema
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

                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentItems.map((q) => (
                                                <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getThemeStyles(q.themeColor)}`}>
                                                            {q.theme}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 mb-1">{q.question}</div>
                                                        <div className="text-xs text-gray-500 line-clamp-2 italic">{q.excerpt}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{q.author}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                        <div>Creado: {q.createdAt}</div>
                                                        <div>Modif: {q.modifiedAt}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => navigate(`/EditQuestion/${q.id}`)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                                                                title="Editar Pregunta"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="p-2 text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition-colors"
                                                                title="Eliminar Pregunta"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
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
                                                {/* Page Numbers */}
                                                {[...Array(totalPages)].map((_, i) => (
                                                    // Only show a subset of pages if too many (simple version: show all or max 5-7. For now showing all as simpler logic, user can refine)
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
            </main>
            <BottomNavigation />
        </div>
    );
};

export default QuestionBank;
