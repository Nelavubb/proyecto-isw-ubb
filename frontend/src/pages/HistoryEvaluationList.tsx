import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, FileText, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getEvaluationsBySubject, EvaluationSummary } from "../services/historyService";
import { useAuth } from "../hooks/useAuth";

const HistoryEvaluationList: React.FC = () => {
    const navigate = useNavigate();
    const { subjectId, semester } = useParams<{ subjectId: string; semester: string }>();
    const location = useLocation();
    const { user } = useAuth();
    const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [subjectName] = useState<string>(
        location.state?.subjectName || "Asignatura"
    );

    useEffect(() => {
        const fetchEvaluations = async () => {
            if (!user?.id || !subjectId || !semester) {
                setLoading(false);
                return;
            }

            try {
                const data = await getEvaluationsBySubject(
                    parseInt(user.id),
                    parseInt(subjectId),
                    semester
                );
                setEvaluations(data);
                setLoading(false);
            } catch (error) {
                console.error("Error cargando evaluaciones", error);
                setLoading(false);
            }
        };

        fetchEvaluations();
    }, [user, subjectId, semester]);

    const handleSelectEvaluation = (evaluationDetailId: number) => {
        navigate(`/history/detail/${evaluationDetailId}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 6.0) return "text-green-600 bg-green-50";
        if (grade >= 4.0) return "text-blue-600 bg-blue-50";
        return "text-red-600 bg-red-50";
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />
            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003366]">
                        <h1 className="text-2xl font-bold text-[#003366] mb-1">
                            {subjectName}
                        </h1>
                        <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <p className="text-sm text-gray-500">{semester}</p>
                        </div>
                    </div>

                    {loading ? (
                        // Estado de carga
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-32 bg-gray-200 rounded-lg animate-pulse"
                                ></div>
                            ))}
                        </div>
                    ) : evaluations.length === 0 ? (
                        // Sin evaluaciones
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <p className="text-gray-600">
                                No hay evaluaciones registradas para esta asignatura.
                            </p>
                            <button
                                onClick={() => navigate("/history/subjects")}
                                className="mt-4 px-6 py-2.5 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 mx-auto"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver a Asignaturas
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {evaluations.map((evaluation) => (
                                    <button
                                        key={evaluation.evaluation_detail_id}
                                        onClick={() => handleSelectEvaluation(evaluation.evaluation_detail_id)}
                                        className="w-full group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left"
                                    >
                                        <div className="flex flex-col gap-4">
                                            {/* Contenido principal */}
                                            <div className="flex items-center gap-4">
                                                {/* Icono */}
                                                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                    <FileText className="w-6 h-6 text-blue-900" />
                                                </div>

                                                {/* Información */}
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800 group-hover:text-[#002e5d]">
                                                        {evaluation.commission_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {evaluation.theme_name}
                                                    </p>
                                                </div>

                                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#002e5d]" />
                                            </div>

                                            {/* Footer con fecha y nota */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(evaluation.date)}
                                                    </span>
                                                </div>
                                                <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getGradeColor(evaluation.grade)}`}>
                                                    {evaluation.grade.toFixed(1)}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => navigate("/history/subjects")}
                                    className="px-6 py-2.5 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver a Asignaturas
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <BottomNavigation />
        </div>
    );
};

export default HistoryEvaluationList;
