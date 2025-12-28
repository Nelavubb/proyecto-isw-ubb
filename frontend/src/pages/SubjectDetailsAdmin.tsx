import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Subject, updateSubject, getSubjectsByUser, getAllSubjects } from '../services/subjectService';
import { getUsers, User } from '../services/userService';
import { getAllTerms, Term } from '../services/termService';
import { StudentSubject, getAllStudentSubjects, enrollStudent, removeStudentFromSubject, updateStudentSubjectStatus } from '../services/studentSubjectService';
import { Users as UsersIcon, GraduationCap, Calendar, Save, ArrowLeft, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios.config';

interface EnrolledStudent extends User {
    status: 'active' | 'inactive';
}

const SubjectDetailsAdmin = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [students, setStudents] = useState<User[]>([]);
    const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
    const [availableStudents, setAvailableStudents] = useState<User[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [terms, setTerms] = useState<Term[]>([]);

    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [editName, setEditName] = useState('');
    const [editTeacherId, setEditTeacherId] = useState<number>(0);
    const [editTermId, setEditTermId] = useState<number>(0);

    // Modal state for adding students
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number>(0);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [allSubjects, allUsers, allTerms, allStudentSubjects] = await Promise.all([
                getAllSubjects(),
                getUsers(),
                getAllTerms(),
                getAllStudentSubjects()
            ]);

            const currentSubject = allSubjects.find(s => s.subject_id === parseInt(id!));
            if (!currentSubject) {
                setToast({ message: 'Asignatura no encontrada', type: 'error' });
                return;
            }

            setSubject(currentSubject);
            setEditName(currentSubject.subject_name);
            setEditTeacherId(currentSubject.user_id);
            setEditTermId(currentSubject.term_id || 0);

            const studentUsers = allUsers.filter((u: User) => u.role === 'Estudiante');
            setStudents(studentUsers);
            setTeachers(allUsers.filter((u: User) => u.role === 'Profesor'));
            setTerms(allTerms);

            const subjectRelations = allStudentSubjects.filter((ss: StudentSubject) => ss.subject_id === parseInt(id!));
            const enrolledIds = subjectRelations.map((ss: StudentSubject) => ss.user_id);

            const enrolled = studentUsers
                .filter(s => enrolledIds.includes(s.user_id))
                .map(s => {
                    const relation = subjectRelations.find(ss => ss.user_id === s.user_id);
                    return { ...s, status: relation?.status || 'active' };
                });

            setEnrolledStudents(enrolled as EnrolledStudent[]);
            setAvailableStudents(studentUsers.filter(s => !enrolledIds.includes(s.user_id)));

        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al cargar los datos', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubject = async () => {
        if (!subject) return;
        try {
            await updateSubject(subject.subject_id, {
                subject_name: editName,
                user_id: editTeacherId,
                term_id: editTermId
            });
            setSubject({ ...subject, subject_name: editName, user_id: editTeacherId, term_id: editTermId });
            setIsEditing(false);
            setToast({ message: 'Asignatura actualizada correctamente', type: 'success' });
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al actualizar la asignatura', type: 'error' });
        }
    };

    const handleAddStudent = async () => {
        if (!selectedStudentId) return;
        try {
            await enrollStudent({
                user_id: selectedStudentId,
                subject_id: parseInt(id!),
                status: 'active'
            });
            setToast({ message: 'Estudiante inscrito correctamente', type: 'success' });
            setShowAddStudentModal(false);
            setSelectedStudentId(0);
            fetchData();
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al inscribir estudiante', type: 'error' });
        }
    };

    const handleRemoveStudent = async (studentId: number) => {
        if (!confirm('¿Está seguro de que desea eliminar al estudiante de esta asignatura?')) return;
        try {
            await removeStudentFromSubject(parseInt(id!), studentId);
            setToast({ message: 'Estudiante eliminado correctamente', type: 'success' });
            fetchData();
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al eliminar estudiante', type: 'error' });
        }
    };

    const handleToggleStatus = async (studentId: number, currentStatus: 'active' | 'inactive') => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await updateStudentSubjectStatus(parseInt(id!), studentId, newStatus);
            setToast({ message: `Estado actualizado a ${newStatus === 'active' ? 'Activo' : 'Inactivo'}`, type: 'success' });
            fetchData();
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al actualizar estado', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            <Header variant="default" title="Facultad de Derecho" />

            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">

                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/admin/subjects')}
                        className="flex items-center text-gray-600 hover:text-[#003366] mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver a Asignaturas
                    </button>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
                        </div>
                    ) : !subject ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 mb-4">Asignatura no encontrada</div>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003366] mb-6 flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#003366] mb-1 flex items-center gap-3">
                                        {subject.subject_name}
                                        {(() => {
                                            const currentTerm = terms.find(t => t.is_current);
                                            const isActive = currentTerm && subject.term_id === currentTerm.term_id;
                                            return (
                                                <span className={`text-sm px-3 py-1 rounded-full font-medium ${isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                                    {isActive ? 'En Curso' : 'Finalizado'}
                                                </span>
                                            );
                                        })()}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Gestión de detalles y estudiantes para esta asignatura.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Subject Details */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-[#003366] rounded-lg">
                                                <GraduationCap className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-lg font-bold text-[#003366]">Información</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                    Nombre de la Asignatura
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                                                    />
                                                ) : (
                                                    <div className="text-gray-900 font-medium">{subject.subject_name}</div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                    Profesor Encargado
                                                </label>
                                                {isEditing ? (
                                                    <select
                                                        value={editTeacherId}
                                                        onChange={(e) => setEditTeacherId(parseInt(e.target.value))}
                                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                                                    >
                                                        {teachers.map(t => (
                                                            <option key={t.user_id} value={t.user_id}>{t.user_name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-700">
                                                            {teachers.find(t => t.user_id === subject.user_id)?.user_name || 'Sin asignar'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                    Periodo Académico
                                                </label>
                                                {isEditing ? (
                                                    <select
                                                        value={editTermId}
                                                        onChange={(e) => setEditTermId(parseInt(e.target.value))}
                                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                                                    >
                                                        <option value={0}>Seleccione...</option>
                                                        {terms.map(t => (
                                                            <option key={t.term_id} value={t.term_id}>{t.code} {t.is_current ? '(Actual)' : ''}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-700">
                                                            {terms.find(t => t.term_id === subject.term_id)?.code || 'Sin periodo'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => {
                                                        if (isEditing) handleUpdateSubject();
                                                        else setIsEditing(true);
                                                    }}
                                                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isEditing
                                                        ? 'bg-[#003366] text-white hover:bg-[#002244]'
                                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {isEditing ? <Save className="w-4 h-4" /> : null}
                                                    {isEditing ? 'Guardar Cambios' : 'Editar Información'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Students List */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-600 rounded-lg">
                                                    <UsersIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-[#003366]">Estudiantes Inscritos</h2>
                                                    <p className="text-sm text-gray-500">Total: {enrolledStudents.length}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowAddStudentModal(true)}
                                                className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors text-sm font-medium flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Inscribir Estudiante
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Estudiante</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">RUT</th>
                                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Estado</th>
                                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {enrolledStudents.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                                <div className="flex flex-col items-center">
                                                                    <UsersIcon className="w-12 h-12 text-gray-300 mb-3" />
                                                                    <p className="font-medium">No hay estudiantes inscritos</p>
                                                                    <p className="text-sm mt-1">Use el botón de inscripción para agregar alumnos.</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        enrolledStudents.map(student => (
                                                            <tr key={student.user_id} className={`hover:bg-gray-50 transition-colors ${student.status === 'inactive' ? 'bg-gray-50 opacity-75' : ''}`}>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-shrink-0 items-center justify-center text-xs font-bold text-[#003366]">
                                                                            {student.user_name.charAt(0)}
                                                                        </div>
                                                                        <div className="ml-3">
                                                                            <div className="text-sm font-medium text-gray-900">{student.user_name}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rut}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'active'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        {student.status === 'active' ? 'Activo' : 'Inactivo'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleToggleStatus(student.user_id, student.status)}
                                                                            className={`p-2 rounded-lg transition ${student.status === 'active'
                                                                                ? 'text-yellow-600 hover:bg-yellow-100'
                                                                                : 'text-green-600 hover:bg-green-100'
                                                                                }`}
                                                                            title={student.status === 'active' ? 'Desactivar' : 'Activar'}
                                                                        >
                                                                            {student.status === 'active' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                                                        </button>
                                                                        <button
                                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition"
                                                                            title="Eliminar"
                                                                            onClick={() => handleRemoveStudent(student.user_id)}
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Toast Notification */}
                    {toast && (
                        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 z-50 flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                            <span>{toast.message}</span>
                            <button onClick={() => setToast(null)} className="ml-2 hover:bg-white/20 rounded-full p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Add Student Modal */}
                    {showAddStudentModal && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddStudentModal(false)}></div>
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10 relative animate-in fade-in zoom-in-95 duration-200">
                                <h3 className="text-xl font-bold text-[#003366] mb-4">Inscribir Estudiante</h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Estudiante</label>
                                    <select
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#003366] focus:border-[#003366] p-2"
                                    >
                                        <option value={0}>Seleccione...</option>
                                        {availableStudents.map(s => (
                                            <option key={s.user_id} value={s.user_id}>{s.user_name} - {s.rut}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setShowAddStudentModal(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleAddStudent}
                                        disabled={!selectedStudentId}
                                        className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition disabled:opacity-50"
                                    >
                                        Inscribir
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <BottomNavigation />
        </div>
    );
};

export default SubjectDetailsAdmin;
