import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { getAllSubjects, createSubject, updateSubject, deleteSubject, Subject } from '../services/subjectService';
import { getUsers, User } from '../services/userService';
import { Plus, Edit2, Trash2, GraduationCap } from "lucide-react";
import { useAuth } from '../hooks/useAuth';

export default function SubjectSelectionAdmin() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [teachers, setTeachers] = useState<User[]>([]);

    const [newSubjectName, setNewSubjectName] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, [user, authLoading]);

    const fetchData = async () => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [subjectsData, usersData] = await Promise.all([
                getAllSubjects(),
                getUsers()
            ]);
            setSubjects(subjectsData);
            setTeachers(usersData.filter(u => u.role === 'Profesor'));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSubject = (subjectId: number) => {
        navigate(`/gestion-asignaturas/${subjectId}`);
    };

    const handleEditClick = (e: React.MouseEvent, subject: Subject) => {
        e.stopPropagation();
        setEditingSubject(subject);
        setNewSubjectName(subject.subject_name);
        setSelectedTeacherId(subject.user_id);
        setErrors([]);
        setShowModal(true);
    };

    const handleDeleteClick = async (e: React.MouseEvent, subjectId: number) => {
        e.stopPropagation();
        if (!window.confirm('¿Está seguro de que desea eliminar esta asignatura?')) return;

        try {
            await deleteSubject(subjectId);
            setToast({ type: 'success', text: 'Asignatura eliminada exitosamente' });
            fetchData();
        } catch (error: any) {
            console.error("Error deleting subject:", error);
            const msg = error.response?.data?.message || 'Error al eliminar la asignatura';
            setToast({ type: 'error', text: msg });
        } finally {
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewSubjectName('');
        setSelectedTeacherId('');
        setEditingSubject(null);
        setErrors([]);
        setToast(null);
    };

    const handleSaveSubject = async () => {
        const trimmedName = newSubjectName.trim();
        const newErrors: string[] = [];

        if (!trimmedName) {
            newErrors.push('El nombre de la asignatura es obligatorio');
        } else {
            if (trimmedName.length < 2) {
                newErrors.push('El nombre debe tener al menos 2 caracteres');
            }
            const nameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/;
            if (!nameRegex.test(trimmedName)) {
                newErrors.push('El nombre contiene caracteres no válidos (solo letras, números, espacios y guiones)');
            }
        }

        if (!selectedTeacherId) {
            newErrors.push('Debe seleccionar un profesor');
        } else {
            const isValidTeacher = teachers.some(t => t.user_id === Number(selectedTeacherId));
            if (!isValidTeacher) {
                newErrors.push('El profesor seleccionado no es válido');
            }
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (editingSubject) {
                await updateSubject(editingSubject.subject_id, {
                    subject_name: newSubjectName,
                    user_id: Number(selectedTeacherId)
                });
                setToast({ type: 'success', text: 'Asignatura actualizada exitosamente' });
            } else {
                await createSubject({
                    subject_name: newSubjectName,
                    user_id: Number(selectedTeacherId)
                });
                setToast({ type: 'success', text: 'Asignatura creada exitosamente' });
            }

            handleCloseModal();
            setToast({ type: 'success', text: editingSubject ? 'Asignatura actualizada exitosamente' : 'Asignatura creada exitosamente' });

            fetchData();
        } catch (error) {
            console.error("Error saving subject:", error);
            setToast({ type: 'error', text: 'Error al guardar la asignatura' });
        } finally {
            setTimeout(() => setToast(null), 3000);
        }
    };

    const getIcon = () => {
        return <GraduationCap className="w-6 h-6 text-[#003366]" />;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />

            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-6xl mx-auto space-y-6">

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003366] flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-[#003366] mb-1">Gestión de Asignaturas (Admin)</h1>
                            <p className="text-sm text-gray-500">
                                Administre todas las asignaturas y sus profesores responsables.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setErrors([]);
                                setShowModal(true);
                            }}
                            className="bg-[#003366] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#004488] transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Agregar Asignatura</span>
                        </button>
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
                                <div
                                    key={subject.subject_id}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
                                >
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        {getIcon()}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800">
                                            {subject.subject_name}
                                        </h3>
                                        {(subject as any).user && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Prof. {(subject as any).user.user_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleEditClick(e, subject)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                                            title="Editar asignatura"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(e, subject.subject_id)}
                                            className="p-2 text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition-colors"
                                            title="Eliminar asignatura"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {subjects.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500">No se encontraron asignaturas.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                    />

                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 z-10 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#003366]">
                                {editingSubject ? 'Editar Asignatura' : 'Agregar Nueva Asignatura'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        {errors.length > 0 && (
                            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Se encontraron errores:
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <ul className="list-disc pl-5 space-y-1">
                                                {errors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la Asignatura
                                </label>
                                <input
                                    type="text"
                                    value={newSubjectName}
                                    onChange={(e) => {
                                        setNewSubjectName(e.target.value);
                                        if (errors.length > 0) setErrors([]);
                                    }}
                                    maxLength={300}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all"
                                    placeholder="Ej. Derecho Civil I"
                                />
                                <div className="flex justify-end mt-1">
                                    <span className={`text-xs ${newSubjectName.length >= 300 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                        {newSubjectName.length}/300
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Profesor Encargado
                                </label>
                                <select
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Seleccione un profesor...</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher.user_id} value={teacher.user_id}>
                                            {teacher.user_name} ({teacher.rut})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveSubject}
                                className="flex-1 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition-colors font-medium"
                            >
                                {editingSubject ? 'Actualizar Asignatura' : 'Guardar Asignatura'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed right-6 bottom-24 max-w-xs p-4 rounded-lg shadow-lg flex items-center gap-3 z-[60] animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    <div className="flex-shrink-0">
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <p className="text-sm font-medium">{toast.text}</p>
                </div>
            )}

            <BottomNavigation />
        </div>
    );
}
