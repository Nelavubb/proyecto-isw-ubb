import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { getAllSubjects, createSubject, updateSubject, deleteSubject, Subject } from '../services/subjectService';
import { getUsers, User } from '../services/userService';
import { getAllTerms, Term, setCurrentTerm, createTerm } from '../services/termService';
import { Plus, Edit2, Trash2, GraduationCap, AlertTriangle } from "lucide-react";
import { useAuth } from '../hooks/useAuth';

export default function SubjectSelectionAdmin() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [terms, setTerms] = useState<Term[]>([]);

    const [newSubjectName, setNewSubjectName] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
    const [selectedTermId, setSelectedTermId] = useState<number | ''>('');
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    // Term Switching State
    const [showTermWarning, setShowTermWarning] = useState(false);
    const [pendingTermId, setPendingTermId] = useState<number | null>(null);

    // Term Creation State
    const [showTermModal, setShowTermModal] = useState(false);
    const [newTermCode, setNewTermCode] = useState('');
    const [termYear, setTermYear] = useState('');
    const [termSemester, setTermSemester] = useState('1');
    const [termErrors, setTermErrors] = useState<string[]>([]);

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
            const [subjectsData, usersData, termsData] = await Promise.all([
                getAllSubjects(),
                getUsers(),
                getAllTerms()
            ]);
            setSubjects(subjectsData);
            setTeachers(usersData.filter(u => u.role === 'Profesor'));
            setTerms(termsData);
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
        navigate(`/admin/subjects/${subject.subject_id}`);
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
        setSelectedTermId('');
        setEditingSubject(null);
        setErrors([]);
        setToast(null);
    };

    const handleCloseTermModal = () => {
        setShowTermModal(false);
        setNewTermCode('');
        setTermYear('');
        setTermSemester('1');
        setTermErrors([]);
    };

    const handleSaveTerm = async () => {
        const year = termYear.trim();
        const semester = termSemester.trim();
        const newErrors: string[] = [];

        if (!year || !semester) {
            newErrors.push('Todos los campos son obligatorios');
        } else {
            if (!/^\d{4}$/.test(year)) {
                newErrors.push('El año debe ser de 4 dígitos');
            }
            if (!/^\d{1}$/.test(semester)) {
                newErrors.push('El semestre debe ser de 1 dígito');
            }
        }

        if (newErrors.length > 0) {
            setTermErrors(newErrors);
            return;
        }

        const formattedCode = `${year}-${semester}`;

        try {
            await createTerm({ code: formattedCode, is_current: false });
            setToast({ type: 'success', text: 'Periodo creado exitosamente' });
            handleCloseTermModal();
            fetchData();
        } catch (error: any) {
            console.error("Error creating term:", error);
            const backendMsg = error.response?.data?.message || 'Error al crear el periodo';
            setToast({ type: 'error', text: backendMsg });
        } finally {
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleSaveSubject = async () => {
        const trimmedName = newSubjectName.trim();
        const newErrors: string[] = [];

        // 1. Validation for Subject Name
        if (!trimmedName) {
            newErrors.push('El nombre de la asignatura es obligatorio');
        } else {
            if (trimmedName.length < 2) {
                newErrors.push('El nombre debe tener al menos 2 caracteres');
            }
            if (trimmedName.length > 300) {
                newErrors.push('El nombre no puede exceder los 300 caracteres');
            }
            // Regex matching backend: Alphanumeric, spaces, accents, hyphens
            const nameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/;
            if (!nameRegex.test(trimmedName)) {
                newErrors.push('El nombre contiene caracteres no válidos (solo letras, números, espacios, guiones y tildes)');
            }
        }

        // 2. Validation for Teacher
        if (!selectedTeacherId) {
            newErrors.push('Debe seleccionar un profesor encargado');
        } else {
            const isValidTeacher = teachers.some(t => t.user_id === Number(selectedTeacherId));
            if (!isValidTeacher) {
                newErrors.push('El profesor seleccionado no es válido');
            }
        }

        // 3. Validation for Term
        if (!selectedTermId) {
            newErrors.push('Debe seleccionar un periodo académico');
        } else {
            // Term must exist in the list
            const isValidTerm = terms.some(t => t.term_id === Number(selectedTermId));
            if (!isValidTerm) {
                newErrors.push('El periodo seleccionado no es válido');
            }
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (editingSubject) {
                await updateSubject(editingSubject.subject_id, {
                    subject_name: trimmedName,
                    user_id: Number(selectedTeacherId),
                    term_id: Number(selectedTermId)
                });
                setToast({ type: 'success', text: 'Asignatura actualizada exitosamente' });
            } else {
                await createSubject({
                    subject_name: trimmedName,
                    user_id: Number(selectedTeacherId),
                    term_id: Number(selectedTermId)
                });
                setToast({ type: 'success', text: 'Asignatura creada exitosamente' });
            }

            handleCloseModal();
            // Toast set above covers the message
            fetchData();
        } catch (error: any) {
            console.error("Error saving subject:", error);
            // Extract error message from backend if available
            const backendMsg = error.response?.data?.message || error.response?.data?.details?.[0]?.message || 'Error al guardar la asignatura';
            setToast({ type: 'error', text: backendMsg });
        } finally {
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const termId = Number(e.target.value);
        const currentTerm = terms.find(t => t.is_current);

        // If selecting the same term, do nothing
        if (currentTerm && currentTerm.term_id === termId) return;

        setPendingTermId(termId);
        setShowTermWarning(true);
    };

    const confirmTermChange = async () => {
        if (!pendingTermId) return;

        try {
            setLoading(true);
            await setCurrentTerm(pendingTermId);
            setToast({ type: 'success', text: 'Periodo actual actualizado. Asignaturas anteriores finalizadas.' });

            // Refresh data to reflect status changes
            await fetchData();
        } catch (error) {
            console.error("Error setting current term:", error);
            setToast({ type: 'error', text: 'Error al cambiar el periodo actual' });
        } finally {
            setLoading(false);
            setShowTermWarning(false);
            setPendingTermId(null);
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

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003366] flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#003366] mb-1">Gestión de Asignaturas (Admin)</h1>
                            <p className="text-sm text-gray-500">
                                Administre todas las asignaturas y sus profesores responsables.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                <span className="text-xs font-medium text-gray-500 whitespace-nowrap uppercase tracking-wide">Periodo:</span>
                                <select
                                    className="bg-transparent text-sm font-bold text-[#003366] focus:outline-none cursor-pointer"
                                    value={terms.find(t => t.is_current)?.term_id || ''}
                                    onChange={handleTermChange}
                                >
                                    {terms.map(t => (
                                        <option key={t.term_id} value={t.term_id}>{t.code}</option>
                                    ))}
                                </select>
                                <div className="w-px h-4 bg-gray-300"></div>
                                <button
                                    onClick={() => setShowTermModal(true)}
                                    className="p-1 text-gray-500 hover:text-[#003366] hover:bg-gray-200 rounded transition-colors"
                                    title="Agregar Nuevo Periodo"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setErrors([]);
                                    setShowModal(true);
                                }}
                                className="bg-[#003366] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#004488] transition-colors shadow-sm w-full sm:w-auto justify-center"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Agregar Asignatura</span>
                            </button>
                        </div>
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
                                        {(subject as any).term_id && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Periodo: {terms.find(t => t.term_id === subject.term_id)?.code || subject.term_id}
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

            {/* Existing Subject Modal */}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Periodo Académico
                                </label>
                                <select
                                    value={selectedTermId}
                                    onChange={(e) => setSelectedTermId(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Seleccione un periodo...</option>
                                    {terms.map((term) => (
                                        <option key={term.term_id} value={term.term_id}>
                                            {term.code} {term.is_current ? '(Actual)' : ''}
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

            {/* Add Term Modal */}
            {showTermModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[80]">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseTermModal}
                    />

                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 z-10 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#003366]">
                                Agregar Nuevo Periodo
                            </h2>
                            <button
                                onClick={handleCloseTermModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        {termErrors.length > 0 && (
                            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
                                <ul className="text-sm text-red-700 list-disc pl-5">
                                    {termErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código del Periodo
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={termYear}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                setTermYear(val);
                                                if (termErrors.length > 0) setTermErrors([]);
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all text-center"
                                            placeholder="2025"
                                            maxLength={4}
                                        />
                                    </div>
                                    <span className="text-xl font-bold text-gray-400">-</span>
                                    <div className="w-20">
                                        <select
                                            value={termSemester}
                                            onChange={(e) => {
                                                setTermSemester(e.target.value);
                                                if (termErrors.length > 0) setTermErrors([]);
                                            }}
                                            className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all text-center appearance-none bg-white"
                                        >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Año - Semestre
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleCloseTermModal}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveTerm}
                                className="flex-1 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition-colors font-medium"
                            >
                                Guardar Periodo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Term Change Warning Modal */}
            {showTermWarning && (
                <div className="fixed inset-0 flex items-center justify-center z-[70]">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => {
                            setShowTermWarning(false);
                            setPendingTermId(null);
                        }}
                    />
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 z-10 relative animate-in fade-in zoom-in-95 duration-200 border-t-4 border-yellow-500">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-yellow-100 rounded-full flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    ¿Cambiar Periodo Actual?
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Al cambiar el periodo actual, todas las asignaturas del periodo anterior finalizarán y los estudiantes pasarán a estado
                                    <span className="font-bold text-red-600"> Inactivo</span> en esas asignaturas.
                                </p>
                                <p className="text-gray-600 text-sm leading-relaxed mt-2 font-medium">
                                    ¿Está seguro de que desea continuar?
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                onClick={() => {
                                    setShowTermWarning(false);
                                    setPendingTermId(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmTermChange}
                                className="px-4 py-2 text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                Sí, Cambiar Periodo.
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
