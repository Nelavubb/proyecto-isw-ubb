import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { getUsers, createUser, deleteUser, User } from '../services/userService';

// Función para generar contraseña usando los últimos 6 dígitos del RUT
const generatePassword = (rut: string): string => {
    // Remover el dígito verificador (todo después del guion)
    const rutNumbers = rut.split('-')[0];
    // Obtener los últimos 6 dígitos
    return rutNumbers.slice(-6);
};

// Función de validación del nombre
const validateUserName = (name: string): string | null => {
    // Verificar que no esté vacío
    if (!name || name.trim().length === 0) {
        return 'El nombre de usuario es obligatorio';
    }

    // Verificar que no sea solo espacios
    if (name.trim().length === 0) {
        return 'El nombre no puede ser solo espacios';
    }

    // Verificar longitud mínima y máxima
    if (name.trim().length < 2) {
        return 'El nombre debe tener al menos 2 caracteres';
    }
    if (name.length > 100) {
        return 'El nombre no puede exceder 100 caracteres';
    }

    // Verificar que no contenga números
    if (/\d/.test(name)) {
        return 'El nombre no puede contener números';
    }

    // Verificar que solo contenga letras, espacios y tildes en vocales (y ñ)
    // No permite caracteres especiales
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
        return 'El nombre solo puede contener letras y espacios. Solo se permiten tildes en vocales';
    }

    // Verificar que tenga al menos un espacio (nombre y apellido)
    if (!/\s/.test(name.trim())) {
        return 'El nombre debe incluir al menos un espacio (nombre y apellido)';
    }

    // Verificar que no sea solo una letra repetida (ej: "qqqq qqqq")
    const cleanName = name.replace(/\s/g, '').toLowerCase();
    if (cleanName.length > 0 && new Set(cleanName).size === 1) {
        return 'El nombre no puede ser solo una letra repetida';
    }

    // Verificar que cada palabra tenga al menos 2 caracteres
    const words = name.trim().split(/\s+/);
    for (const word of words) {
        if (word.length < 2) {
            return 'Cada palabra del nombre debe tener al menos 2 caracteres';
        }
    }

    return null;
};

// Función de validación general
const validateUserData = (data: { rut: string; user_name: string; role: string }): string | null => {
    if (!data.rut) return 'El RUT es obligatorio';
    if (!data.role) return 'El rol es obligatorio';

    // Validar formato del RUT (XXX-X)
    if (!/^[0-9]+-[0-9kK]$/.test(data.rut)) {
        return 'El RUT debe tener el formato: solo números, un guion y el dígito verificador (número o k/K)';
    }

    // Validar nombre con la función especializada
    const nameError = validateUserName(data.user_name);
    if (nameError) return nameError;

    // Validar rol
    if (!['Estudiante', 'Profesor', 'Administrador'].includes(data.role)) {
        return 'El rol debe ser: Estudiante, Profesor o Administrador';
    }

    return null;
};

export default function Users() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const [formData, setFormData] = useState<{ rut: string; user_name: string; role: string; password: string }>({
        rut: '',
        user_name: '',
        role: '',
        password: '',
    });
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                rut: user.rut,
                user_name: user.user_name,
                role: user.role,
                password: '',
            });
        } else {
            setEditingUser(null);
            setFormData({ rut: '', user_name: '', role: '', password: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ rut: '', user_name: '', role: '', password: '' });
    };

    const handleSaveUser = async () => {
        try {
            // Validar datos
            const validationError = validateUserData(formData);
            if (validationError) {
                setToast({ type: 'error', text: validationError });
                setTimeout(() => setToast(null), 3000);
                return;
            }

            // Generar contraseña usando últimos 6 dígitos del RUT
            const password = generatePassword(formData.rut);

            // Crear usuario con contraseña
            await createUser({
                ...formData,
                password
            });

            setToast({ type: 'success', text: 'Usuario agregado exitosamente' });
            setTimeout(() => setToast(null), 3000);
            handleCloseModal();
            fetchUsers();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            setToast({ type: 'error', text: 'Error al guardar el usuario' });
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleDeleteUser = async (user: User) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                await deleteUser(userToDelete.user_id);
                setToast({ type: 'success', text: 'Usuario eliminado exitosamente' });
                setTimeout(() => setToast(null), 3000);
                fetchUsers();
                setShowDeleteConfirm(false);
                setUserToDelete(null);
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                setToast({ type: 'error', text: 'Error al eliminar el usuario' });
                setTimeout(() => setToast(null), 3000);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />

            {/* Main Container */}
            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Page Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#003366] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#003366] mb-1">Gestión de Usuarios</h1>
                            <p className="text-sm text-gray-500">
                                Visualiza y gestiona todos los usuarios del sistema.
                            </p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar Usuario
                        </button>
                    </div>

                    {/* Tabla de Usuarios */}
                    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                        {loading ? (
                            <div className="p-12 flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                                <span className="ml-3 text-gray-500">Cargando usuarios...</span>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900">No hay usuarios registrados</h3>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-[#003366]">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                RUT
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                Nombre de Usuario
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                Rol
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{user.rut}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700">{user.user_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(user)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="p-2 text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            {/* Modal para agregar/editar usuario */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                    />

                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 z-10 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#003366]">
                                {editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    RUT <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.rut}
                                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                                    placeholder="12.345.678-9"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre de Usuario <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.user_name}
                                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                                    placeholder="Nombre Completo"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Rol <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
                                >
                                    <option value="">Seleccionar Rol</option>
                                    <option value="Estudiante">Estudiante</option>
                                    <option value="Profesor">Profesor</option>
                                    <option value="Administrador">Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveUser}
                                className="flex-1 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition font-medium"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {showDeleteConfirm && userToDelete && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                        onClick={() => {
                            setShowDeleteConfirm(false);
                            setUserToDelete(null);
                        }}
                    />

                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Usuario</h3>
                            <p className="text-gray-600">
                                ¿Estás seguro de que deseas eliminar al usuario <span className="font-semibold text-gray-900">{userToDelete.user_name}</span>? Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setUserToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed right-6 bottom-24 max-w-xs p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    <div className="flex-shrink-0">
                        {toast.type === 'success' && (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {toast.type === 'error' && (
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
