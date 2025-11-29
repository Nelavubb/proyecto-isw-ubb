import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

type TabType = 'usuario' | 'aplicacion';

const Configuracion = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('usuario');
  const [telefono, setTelefono] = useState('+56 9 1234 5678');
  const [correoPersonal, setCorreoPersonal] = useState('juan.perez@ubiobio.cl');
  const [isEditingTelefono, setIsEditingTelefono] = useState(false);
  const [isEditingCorreo, setIsEditingCorreo] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveTelefono = () => {
    setIsEditingTelefono(false);
    // Aquí iría la lógica para guardar en el backend
  };

  const handleSaveCorreo = () => {
    setIsEditingCorreo(false);
    // Aquí iría la lógica para guardar en el backend
  };

  // Datos mock según el rol del usuario
  const getUserEmail = () => {
    if (user.role === 'Profesor') {
      return 'juan.perez@ubiobio.cl';
    }
    const nameWithoutSpaces = user.name.toLowerCase().replace(/\s+/g, '.');
    return `${nameWithoutSpaces}@ubiobio.cl`;
  };

  const getUserSubject = () => {
    if (user.role === 'Profesor') {
      return 'Derecho Penal I';
    }
    if (user.role === 'Estudiante') {
      return 'Derecho Civil I';
    }
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Facultad de Derecho" />

      {/* Background azul que se extiende */}
      <div className="bg-[#003366] h-10"></div>

      <div className="sticky top-18 z-0 bg-[#003366]">
        <div className="h-3 bg-gray-100 rounded-t-3xl mx-auto"></div>
      </div>

      {/* Espaciado para el header fijo y bottom navigation */}
      <div className="relative z-10 pt-20 px-6 pb-24 max-w-5xl mx-auto">
        {/* Título de la página */}
        <div className="mb-4">
          <h2 className="text-4xl font-bold text-[#003366]">Configuración</h2>
        </div>

        {/* Tabs */}
        <div className="relative z-10 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-t border-gray-200">
            <button
              onClick={() => setActiveTab('usuario')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${activeTab === 'usuario'
                ? 'bg-white text-[#003366] border-b-2 border-[#003366]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-50'
                }`}
            >
              Usuario
            </button>
            <button
              onClick={() => setActiveTab('aplicacion')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${activeTab === 'aplicacion'
                ? 'bg-white text-[#003366] border-b-2 border-[#003366]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-50'
                }`}
            >
              Aplicación
            </button>
          </div>

          {/* Contenido del Tab Usuario */}
          {activeTab === 'usuario' && (
            <div className="p-4">
              {/* Información del Usuario */}
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h3>

                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Correo: </span>{getUserEmail()}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Rol:</span> {user.role}
                </p>
              </div>

              {/* Sección de Contacto */}
              <div>
                <h4 className="text-xl font-bold text-[#003366] mb-6">Contacto</h4>

                {/* Teléfono */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                        {isEditingTelefono ? (
                          <input
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
                            autoFocus
                          />
                        ) : (
                          <p className="text-lg font-semibold text-gray-800">{telefono}</p>
                        )}
                      </div>
                    </div>
                    {isEditingTelefono ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveTelefono}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Guardar"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setIsEditingTelefono(false)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingTelefono(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar teléfono"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Correo Personal */}
                <div className="mb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Correo Personal</p>
                        {isEditingCorreo ? (
                          <input
                            type="email"
                            value={correoPersonal}
                            onChange={(e) => setCorreoPersonal(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
                            autoFocus
                          />
                        ) : (
                          <p className="text-lg font-semibold text-gray-800">{correoPersonal}</p>
                        )}
                      </div>
                    </div>
                    {isEditingCorreo ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveCorreo}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Guardar"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setIsEditingCorreo(false)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingCorreo(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar correo"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="w-full mt-8 py-4 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          )}

          {/* Contenido del Tab Aplicación */}
          {activeTab === 'aplicacion' && (
            <div className="p-4">
              <div className="space-y-2">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Tema</h4>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                    <option value="arcoiris">Arcoíris</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Idioma</h4>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 text-[#003366] border-gray-300 rounded focus:ring-[#003366]"
                defaultChecked
              />
              <span className="text-gray-700">Recibir notificaciones por correo</span>
            </label>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 text-[#003366] border-gray-300 rounded focus:ring-[#003366]"
                defaultChecked
              />
              <span className="text-gray-700">Notificaciones push</span>
            </label>
          </div>

          <div className="mt-4 pt-2 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Acerca de</h4>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-semibold">Versión:</span> 0.0.1
              </p>
              <p>
                <span className="font-semibold">Sistema:</span> Gestión de Evaluaciones Orales
              </p>
              <p>
                <span className="font-semibold">Facultad:</span> Derecho - Universidad
              </p>
            </div>
          </div>
        </div>
      </div>
          )}
    </div>
      </div >

  <BottomNavigation />
    </div >
  );
};

export default Configuracion;
