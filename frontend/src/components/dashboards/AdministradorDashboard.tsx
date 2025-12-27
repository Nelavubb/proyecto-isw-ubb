import { User } from '../../types/auth.types';
import Header from '../Header.tsx';
import BottomNavigation from '../BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createUser } from '../../services/userService';

// Función para generar contraseña usando los últimos 6 dígitos del RUT
const generatePassword = (rut: string): string => {
    // Remover el dígito verificador (todo después del guion)
    const rutNumbers = rut.split('-')[0];
    // Obtener los últimos 6 dígitos
    return rutNumbers.slice(-6);
};

// Función de validación
const validateUserData = (data: { rut: string; user_name: string; role: string }): string | null => {
    if (!data.rut) return 'El RUT es obligatorio';
    if (!data.user_name) return 'El nombre de usuario es obligatorio';
    if (!data.role) return 'El rol es obligatorio';
    
    // Validar formato del RUT (XXX-X)
    if (!/^[0-9]+-[0-9kK]$/.test(data.rut)) {
        return 'El RUT debe tener el formato: solo números, un guion y el dígito verificador (número o k/K)';
    }
    
    // Validar nombre
    if (data.user_name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (data.user_name.length > 100) return 'El nombre no puede exceder 100 caracteres';
    
    // Validar rol
    if (!['Estudiante', 'Profesor', 'Administrador'].includes(data.role)) {
        return 'El rol debe ser: Estudiante, Profesor o Administrador';
    }
    
    return null;
};

interface AdministradorDashboardProps {
  user: User;
}

const AdministradorDashboard = ({ user }: AdministradorDashboardProps) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<{ rut: string; user_name: string; role: string; password: string }>({
    rut: '',
    user_name: '',
    role: '',
    password: '',
  });

  const handleCloseModal = () => {
    setShowModal(false);
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
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setToast({ type: 'error', text: 'Error al guardar el usuario' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <>
      <Header variant="dashboard" />

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 -mt-36 pb-24">
        {/* Welcome Section */}
        <div className="mb-6 text-white">
          <h2 className="text-3xl font-bold">Bienvenido(a), {user.name}</h2>
          <p className="mt-1 text-white/80">Rol: {user.role}</p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">342</h3>
            <p className="text-gray-600 text-sm">Estudiantes Activos</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">45</h3>
            <p className="text-gray-600 text-sm">Profesores</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">28</h3>
            <p className="text-gray-600 text-sm">Comisiones Activas</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">156</h3>
            <p className="text-gray-600 text-sm">Evaluaciones Este Mes</p>
          </div>
        </div>

        {/* Gestión Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Gestión de Comisiones</h3>
            <p className="text-gray-600 mb-4">Administra las comisiones de evaluación oral.</p>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-left flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Nueva Comisión
              </button>
              <button className="w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition text-left flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Ver Todas las Comisiones
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Gestión de Usuarios</h3>
            <p className="text-gray-600 mb-4">Administra estudiantes y profesores.</p>
            <div className="space-y-3">
              <button 
                onClick={() => setShowModal(true)}
                className="w-full px-4 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-left flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Agregar Nuevo Usuario
              </button>
              <button 
                onClick={() => navigate('/usuarios')}
                className="w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition text-left flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Administrar Usuarios
              </button>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente del Sistema</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 border-l-4 border-green-500 bg-green-50">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Comisión de Derecho Civil I completada</p>
                <p className="text-gray-500 text-sm">Hace 2 horas</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border-l-4 border-blue-500 bg-blue-50">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Nuevo profesor registrado: Dr. Ricardo Fernández</p>
                <p className="text-gray-500 text-sm">Hace 5 horas</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 border-l-4 border-purple-500 bg-purple-50">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">Nueva comisión programada para el 20 de Octubre</p>
                <p className="text-gray-500 text-sm">Hace 1 día</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para agregar usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#003366]">Agregar Nuevo Usuario</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
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
                  placeholder="Juan Pérez"
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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed right-6 bottom-24 max-w-xs p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
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
    </>
  );
};

export default AdministradorDashboard;
