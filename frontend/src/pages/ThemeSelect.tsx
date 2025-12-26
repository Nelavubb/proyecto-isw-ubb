import React, { useState, useEffect } from "react";
import { BookOpen, ChevronRight, ArrowLeft, FileText, List } from "lucide-react";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getThemesBySubject, Theme } from "../services/themeService";

const ThemeSelect: React.FC = () => {
    const navigate = useNavigate();
    const { subjectId } = useParams<{ subjectId: string }>();
    const location = useLocation();
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [subjectName, setSubjectName] = useState<string>(
        location.state?.subjectName || "Asignatura"
    );

    useEffect(() => {
        const fetchThemes = async () => {
            if (!subjectId) return;

            try {
                const data = await getThemesBySubject(parseInt(subjectId));
                setThemes(data);
                setLoading(false);
            } catch (error) {
                console.error("Error cargando temas", error);
                setLoading(false);
            }
        };

        fetchThemes();
    }, [subjectId]);

    const handleSelectTheme = (id: number, name: string) => {
        console.log(`Tema seleccionado: ${id}`);
        navigate(`/practice/quiz/${id}`, { state: { themeName: name } });
    };

    // Función auxiliar para dar iconos dinámicos según el tema
    const getIcon = (name: string) => {
        if (name.toLowerCase().includes("introducción") || name.toLowerCase().includes("fundamentos"))
            return <BookOpen className="w-6 h-6 text-blue-900" />;
        if (name.toLowerCase().includes("práctica") || name.toLowerCase().includes("ejercicio"))
            return <FileText className="w-6 h-6 text-blue-900" />;
        return <List className="w-6 h-6 text-blue-900" />;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />
            <main className="flex-1 z-10 max-w-4xl mx-auto w-full p-6 pt-24 pb-24">
                <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                    <div className="border-l-4 border-blue-900 pl-4">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Temas de {subjectName}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Selecciona un tema para practicar
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
                ) : themes.length === 0 ? (
                    // Sin temas
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-600">
                            No hay temas disponibles para esta asignatura.
                        </p>
                        <button
                            onClick={() => navigate("/practice/subjects")}
                            className="mt-4 px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver a Asignaturas
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {themes.map((theme) => (
                                <button
                                    key={theme.theme_id}
                                    onClick={() => handleSelectTheme(theme.theme_id, theme.theme_name)}
                                    className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left flex items-center gap-4"
                                >
                                    {/* Contenedor del Icono */}
                                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        {getIcon(theme.theme_name)}
                                    </div>

                                    {/* Texto Del contenedor*/}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 group-hover:text-[#002e5d]">
                                            {theme.theme_name}
                                        </h3>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#002e5d]" />
                                </button>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => navigate("/practice/subjects")}
                                className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver a Asignaturas
                            </button>
                        </div>
                    </>
                )}
            </main>
            <BottomNavigation />
        </div>
    );
};

export default ThemeSelect;
