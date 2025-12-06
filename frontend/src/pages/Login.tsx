import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types/auth.types';

const Login = () => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Estudiante' | 'Profesor' | 'Administrador'>('Estudiante');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginDev } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Si ambos campos están vacíos → Modo desarrollo
      if (!rut.trim() && !password.trim()) {
        const mockUser: User = {
          id: '1',
          name: 'Usuario de Prueba',
          rut: '12345678-9',
          role: selectedRole
        };
        const mockToken = 'mock-jwt-token-' + selectedRole;
        
        loginDev(mockUser, mockToken);
        navigate('/dashboard');
        return;
      }

      // Si alguno de los campos tiene contenido → Login real
      if (!rut.trim() || !password.trim()) {
        setError('Por favor ingrese RUT y contraseña');
        setIsLoading(false);
        return;
      }

      // Login con backend
      await login({ rut: rut.trim(), password: password.trim() });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#003366] text-white py-4 px-6">
        <div className="flex items-center">
          <div>
            <img src="/imgs/ubb_logo_extendido.png"
              alt="Logo UBB"
              className="h-12 w-auto object-contain bg-white/95 rounded-md px-3 py-1.5 border border-white/20 shadow-sm hover:bg-white transition-colors cursor-pointer" 
              />
          </div>
          <div className="h-10 w-px m-3 bg-white/30"></div>
          <h1 className="text-lg font-semibold">
            Facultad de Derecho - Sistema de Evaluaciones
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido</h2>
            <p className="text-gray-600">Inicie sesión para acceder al sistema.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Development Mode Notice */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Modo desarrollo:</strong> Deje los campos vacíos para acceso rápido, 
                o ingrese credenciales para login real.
              </p>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
              <label 
                htmlFor="role" 
                className="block text-gray-700 font-semibold mb-2"
              >
                Rol (Solo para modo desarrollo)
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'Estudiante' | 'Profesor' | 'Administrador')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Estudiante">Estudiante</option>
                <option value="Profesor">Profesor</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            {/* RUT Field */}
            <div className="mb-6">
              <label 
                htmlFor="rut" 
                className="block text-gray-700 font-semibold mb-2"
              >
                RUT <span className="text-gray-500 font-normal text-sm">(vacío = modo desarrollo)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="w-5 h-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="rut"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  placeholder="Ej: 12345678-9"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label 
                htmlFor="password" 
                className="block text-gray-700 font-semibold mb-2"
              >
                Contraseña <span className="text-gray-500 font-normal text-sm">(vacío = modo desarrollo)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="w-5 h-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg 
                      className="w-5 h-5 text-gray-400 hover:text-gray-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
                      />
                    </svg>
                  ) : (
                    <svg 
                      className="w-5 h-5 text-gray-400 hover:text-gray-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#003366] text-white font-semibold py-3 rounded-lg hover:bg-[#004488] transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
