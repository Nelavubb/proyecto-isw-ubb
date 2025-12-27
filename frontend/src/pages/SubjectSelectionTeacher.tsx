import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { getSubjectsByUser, Subject } from '../services/subjectService';
import { ChevronRight, GraduationCap } from "lucide-react";
import { useAuth } from '../hooks/useAuth';

export default function GestionTemas() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (authLoading) return;

            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userId = parseInt(user.id);
                const data = await getSubjectsByUser(userId);
                setSubjects(data);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [user, authLoading]);

    const handleSelectSubject = (subjectId: number) => {
        navigate(`/gestion-asignaturas/${subjectId}`);
    };

    const getIcon = () => {
        return <GraduationCap className="w-6 h-6 text-[#003366]" />;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />

            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003366]">
                        <h1 className="text-2xl font-bold text-[#003366] mb-1">Gestión de Asignaturas</h1>
                        <p className="text-sm text-gray-500">
                            Seleccione una asignatura para gestionar sus temas y preguntas.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjects.map((subject) => (
                                <button
                                    key={subject.subject_id}
                                    onClick={() => handleSelectSubject(subject.subject_id)}
                                    className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left flex items-center gap-4"
                                >
                                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        {getIcon()}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 group-hover:text-[#002e5d]">
                                            {subject.subject_name}
                                        </h3>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#002e5d]" />
                                </button>
                            ))}

                            {subjects.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500">No se encontraron asignaturas asignadas.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <BottomNavigation />
        </div>
    );
}
