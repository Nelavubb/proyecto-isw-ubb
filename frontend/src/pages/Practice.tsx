import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { getQuestionsByTheme, Question } from "../services/questionService";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";

const Practice: React.FC = () => {
    const { themeId } = useParams<{ themeId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [themeName, setThemeName] = useState<string>(
        location.state?.themeName || "Tema"
    );
    const [loading, setLoading] = useState(true);
    const difficulty = location.state?.difficulty || 'all';
    // Estado para manejar qué respuestas están visibles (por ID de pregunta)
    const [visibleAnswers, setVisibleAnswers] = useState<Record<number, boolean>>(
        {}
    );

    useEffect(() => {
        const fetchData = async () => {
            if (!themeId) return;
            try {
                setLoading(true);

                const questionsData = await getQuestionsByTheme(parseInt(themeId), difficulty);
                setQuestions(questionsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [themeId, location.state, difficulty]);

    const toggleAnswer = (questionId: number) => {
        setVisibleAnswers((prev) => ({
            ...prev,
            [questionId]: !prev[questionId],
        }));
    };

    // Función para volver a la página anterior (temas)
    const goBack = () => {
        // Intentar obtener el subjectId del state si está disponible
        if (location.state?.subjectId) {
            navigate(`/practice/themes/${location.state.subjectId}`);
        } else {
            // Si no hay subjectId, volver a asignaturas
            navigate("/practice/subjects");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (questions.length === 0 && difficulty === 'all') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <Header />
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Esta práctica no se encuentra disponible por el momento.
                </h2>
                <button
                    onClick={goBack}
                    className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                </button>
                <BottomNavigation />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />
            <main className="flex-1 z-10 max-w-4xl mx-auto w-full p-6 pt-24 pb-24">
                <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                    <div className="border-l-4 border-blue-900 pl-4">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Práctica de {themeName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-500 text-sm">
                                Responde las siguientes preguntas para practicar
                            </p>
                            {difficulty !== 'all' && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    Dificultad: {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Media' : 'Difícil'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {questions.length === 0 && difficulty !== 'all' ? (
                        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                            <p className="text-gray-500">No hay preguntas disponibles para la dificultad seleccionada.</p>
                        </div>
                    ) : (
                        questions.map((question, index) => (
                            <div
                                key={question.id_question}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </span>
                                        <h3 className="text-lg font-semibold text-gray-800 leading-relaxed flex-1">
                                            {question.question_text}
                                        </h3>
                                    </div>

                                    <div className="mt-6 pl-12">
                                        <button
                                            onClick={() => toggleAnswer(question.id_question)}
                                            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${visibleAnswers[question.id_question]
                                                ? "bg-blue-50 text-blue-700"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            {visibleAnswers[question.id_question] ? (
                                                <>
                                                    <EyeOff className="w-4 h-4" />
                                                    Ocultar Respuesta
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-4 h-4" />
                                                    Ver Respuesta
                                                </>
                                            )}
                                        </button>

                                        {visibleAnswers[question.id_question] && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in">
                                                <p className="text-gray-700 leading-relaxed">
                                                    {question.answer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )))}
                </div>

                <div className="mt-12 flex justify-center">
                    <button
                        onClick={goBack}
                        className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </button>
                </div>
            </main>
            <BottomNavigation />
        </div>
    );
};

export default Practice;
