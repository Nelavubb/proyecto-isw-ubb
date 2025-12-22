import React, { useState, useEffect } from "react";
import { BookOpen, ChevronRight, Scale, Gavel, Landmark } from "lucide-react";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
// Asegúrate de tener instalada la librería de iconos: npm install lucide-react
import { useNavigate } from "react-router-dom";
import { getCategories, Category } from "../services/categoryService";

const SimulationSelect: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
                setLoading(false);
            } catch (error) {
                console.error("Error cargando categorías", error);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleSelectCategory = (id: number, name: string) => {
        console.log(`Categoría seleccionada: ${id}`);
        navigate(`/simulation/practica/${id}`, { state: { categoryName: name } });
    };

    // Función auxiliar para dar iconos dinámicos según el tema
    const getIcon = (name: string) => {
        if (name.includes("Penal"))
            return <Gavel className="w-6 h-6 text-blue-900" />;
        if (name.includes("Constitucional"))
            return <Landmark className="w-6 h-6 text-blue-900" />;
        if (name.includes("prueba"))
            return <BookOpen className="w-6 h-6 text-blue-900" />;
        return <Scale className="w-6 h-6 text-blue-900" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 max-w-4xl mx-auto w-full p-6 pt-24 pb-24">
                <div className="mb-8">
                    <div className="border-l-4 border-blue-900 pl-4">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Práctica de Evaluaciones
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Selecciona un área del derecho que deseas estudiar
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
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.id_category}
                                onClick={() => handleSelectCategory(cat.id_category, cat.name)}
                                className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left flex items-center gap-4"
                            >
                                {/* Contenedor del Icono */}
                                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    {getIcon(cat.name)}
                                </div>

                                {/* Texto Del contenedor*/}
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 group-hover:text-[#002e5d]">
                                        {cat.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {cat.description}
                                    </p>
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

export default SimulationSelect;
