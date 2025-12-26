import React, { useState, useEffect } from "react";
import { BookOpen, ChevronRight, Calendar, Book } from "lucide-react";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { getSubjectHistory, SubjectHistory } from "../services/historyService";
import { useAuth } from "../hooks/useAuth";

const HistorySubjectSelect: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<SubjectHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!user?.id) {
                console.error("No hay usuario autenticado");
                setLoading(false);
                return;
            }

            try {
                const data = await getSubjectHistory(parseInt(user.id));
                setSubjects(data);
                setLoading(false);
            } catch (error) {
                console.error("Error cargando historial de asignaturas", error);
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [user]);

    const handleSelectSubject = (subjectId: number, subjectName: string, semester: string) => {
        navigate(`/history/evaluations/${subjectId}/${semester}`, {
            state: { subjectName, semester }
        });
    };

    // Función auxiliar para dar iconos dinámicos según la asignatura
    const getIcon = (name: string) => {
        if (name.toLowerCase().includes("derecho"))
            return <BookOpen className="w-6 h-6 text-blue-900" />;
        return <Book className="w-6 h-6 text-blue-900" />;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />
            <main className="flex-1 z-10 max-w-4xl mx-auto w-full p-6 pt-24 pb-24">
                <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                    <div className="border-l-4 border-blue-900 pl-4">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Historial de Asignaturas
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Todas las asignaturas que has cursado
                        </p>
                    </div>
                </div>
                {loading ? (
                    // Estado de carga (Skeletons)
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-24 bg-gray-200 rounded-lg animate-pulse"
                            ></div>
                        ))}
                    </div>
                ) : subjects.length === 0 ? (
                    // Sin asignaturas
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-600">
                            No tienes asignaturas en tu historial.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="mt-4 px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map((subject) => (
                            <button
                                key={`${subject.subject_id}-${subject.semester}`}
                                onClick={() => handleSelectSubject(subject.subject_id, subject.subject_name, subject.semester)}
                                className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left flex items-center gap-4"
                            >
                                {/* Contenedor del Icono */}
                                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    {getIcon(subject.subject_name)}
                                </div>

                                {/* Texto Del contenedor*/}
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 group-hover:text-[#002e5d]">
                                        {subject.subject_name}
                                    </h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{subject.semester}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#002e5d]" />
                            </button>
                        ))}
                    </div>
                )}
            </main>
            <BottomNavigation />
        </div>
    );
};

export default HistorySubjectSelect;
