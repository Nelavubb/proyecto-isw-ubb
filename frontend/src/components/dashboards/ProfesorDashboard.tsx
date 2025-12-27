import { User } from '../../types/auth.types';
import Header from '../Header.tsx';
import BottomNavigation from '../BottomNavigation';
import { Link } from 'react-router-dom';

interface ProfesorDashboardProps {
  user: User;
}

const ProfesorDashboard = ({ user }: ProfesorDashboardProps) => {
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

        {/* Comisiones a Evaluar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Comisiones a Evaluar</h3>

          <div className="space-y-4">
            {/* Comisión 1 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Derecho Civil I - Comisión A</h4>
                  <p className="text-sm text-gray-600">8 estudiantes asignados</p>
                  <p className="text-sm text-gray-500">18 de Octubre, 14:00 PM</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">Pendiente</span>
            </div>

            {/* Comisión 2 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Derecho Penal II - Comisión B</h4>
                  <p className="text-sm text-gray-600">6 estudiantes asignados</p>
                  <p className="text-sm text-gray-500">25 de Octubre, 10:00 AM</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Programada</span>
            </div>
          </div>
        </div>

        {/* Evaluaciones Pendientes */}
        {/*<div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Evaluaciones Pendientes de Calificar</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-800 font-medium">3 evaluaciones sin calificar</span>
              </div>
              <button className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm">
                Ver ahora
              </button>
            </div>
          </div>
        </div>*/}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Evaluaciones Pendientes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Evaluaciones Pendientes de Calificar</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-800 font-medium">3 evaluaciones sin calificar.</span>
                </div>
                <button className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm">
                  Ver ahora
                </button>
              </div>
            </div>
          </div>

          {/* Agregar Preguntas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Gestionar Asignaturas</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-800 font-medium">Agregar temas y preguntas.</span>
                </div>
                <Link to="/gestion-asignaturas" className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm">
                  Gestionar
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Realizar Evaluaciones */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Realizar Evaluaciones</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-800 font-medium">Evalúa a los estudiantes según los criterios establecidos.</span>
              </div>
              <Link to="/RealizarEvaluacion" className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm">
                Ir a Evaluación
              </Link>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </>
  );
};

export default ProfesorDashboard;
