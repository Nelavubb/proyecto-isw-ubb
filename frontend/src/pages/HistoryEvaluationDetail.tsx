import React, { useState, useEffect } from "react";
import { ArrowLeft, Award, MessageSquare, CheckCircle } from "lucide-react";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import { useNavigate, useParams } from "react-router-dom";
import { getEvaluationDetail, EvaluationDetail } from "../services/historyService";

const HistoryEvaluationDetail: React.FC = () => {
    const navigate = useNavigate();
    const { evaluationDetailId } = useParams<{ evaluationDetailId: string }>();
    const [evaluation, setEvaluation] = useState<EvaluationDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvaluationDetail = async () => {
            if (!evaluationDetailId) {
                setLoading(false);
                return;
            }

            try {
                const data = await getEvaluationDetail(parseInt(evaluationDetailId));
                setEvaluation(data);
                setLoading(false);
            } catch (error) {
                console.error("Error cargando detalle de evaluación", error);
                setLoading(false);
            }
        };

        fetchEvaluationDetail();
    }, [evaluationDetailId]);

    const getGradeColor = (grade: number) => {
        if (grade >= 6.0) return "text-green-600 bg-green-50 border-green-200";
        if (grade >= 4.0) return "text-blue-600 bg-blue-50 border-blue-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const calculatePercentage = (actual: number, max: number) => {
        return ((actual / max) * 100).toFixed(0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <Header />
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    No se encontró la evaluación.
                </h2>
                <button
                    onClick={() => navigate("/history/subjects")}
                    className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Historial
                </button>
                <BottomNavigation />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />
            <main className="flex-1 z-10 max-w-4xl mx-auto w-full p-6 pt-24 pb-24">
                {/* Nota Final */}
                <div className={`mb-8 rounded-lg shadow-md p-6 border-2 ${getGradeColor(evaluation.grade)}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-full">
                            <Award className="w-8 h-8 text-blue-900" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-600 uppercase">Nota Final</h3>
                            <p className="text-4xl font-bold mt-1">{evaluation.grade.toFixed(1)}</p>
                        </div>
                    </div>
                </div>

                {/* Observación/Retroalimentación */}
                {evaluation.observation && (
                    <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start gap-3">
                            <MessageSquare className="w-6 h-6 text-blue-900 mt-1" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    Retroalimentación del Profesor
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {evaluation.observation}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Desglose de Pauta */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-blue-900" />
                        Desglose de Pauta
                    </h3>

                    {evaluation.scores.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                            No hay detalles de pauta disponibles.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                            Criterio
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-32">
                                            Puntaje Obtenido
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-32">
                                            Puntaje Máximo
                                        </th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-24">
                                            %
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {evaluation.scores.map((score, index) => (
                                        <tr
                                            key={score.criterion_id}
                                            className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                                }`}
                                        >
                                            <td className="py-4 px-4 text-gray-800">
                                                {score.description || 'Sin descripción'}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-bold text-blue-900">
                                                    {score.actual_score.toFixed(1)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center text-gray-600">
                                                {score.max_score.toFixed(1)}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {calculatePercentage(score.actual_score, score.max_score)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-12 flex justify-center">
                    <button
                        onClick={() => navigate(-1)}
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

export default HistoryEvaluationDetail;
