import { User } from '../../types/auth.types';
import Header from '../Header.tsx';
import BottomNavigation from '../BottomNavigation';
import { Link } from 'react-router-dom';

interface EstudianteDashboardProps {
  user: User;
}

const EstudianteDashboard = ({ user }: EstudianteDashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header variant="dashboard" />

      {/* Main Content (z-10) */}
      {/* -mt-36 pulls the content UP over the blue background and curve provided by Header */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 -mt-36 pb-24">

        {/* Welcome Section */}
        {/* Transparent background, text sits on the blue h-60 block */}
        <div className="mb-8 text-white">
          <h2 className="text-3xl font-bold">Bienvenido(a), {user.name}</h2>
          <p className="mt-1 text-white/80 text-lg">Rol: {user.role}</p>
        </div>

        {/* Dashboard Cards Container */}
        <div className="space-y-6">

          {/* Comisiones Próximas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Comisiones Próximas</h3>

            <div className="space-y-4">
              {/* Comisión 1 */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Derecho Civil I</h4>
                    <p className="text-sm text-gray-600">A301AC</p>
                    <p className="text-sm text-gray-500">15 de Octubre, 10:00 AM</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              {/* Comisión 2 */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Derecho Penal II</h4>
                    <p className="text-sm text-gray-600">A102AD</p>
                    <p className="text-sm text-gray-500">22 de Octubre, 09:00 AM</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Prácticas Activas */}
          {/*<div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Prácticas Activas
            </h3>
            <p className="text-gray-600 mb-4">
              Prepárate para tus evaluaciones practicando con nuestras preguntas
              simuladas.
            </p>

            <Link to="/SimulationSelect" className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm"> Practicar ahora</Link>
          </div>*/}

          {/* Prácticas Activas */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Prácticas Activas</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-sky-50 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 110 20 10 10 0 010-20z M12 6a6 6 0 110 12 6 6 0 010-12z M12 10a2 2 0 110 4 2 2 0 010-4z" />
                  </svg>
                  <span className="text-gray-800 font-medium">Prepárate para tus evaluaciones practicando con nuestras preguntas simuladas.</span>
                </div>
                <Link to="/SimulationSelect" className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm">
                  Practicar ahora
                </Link>
              </div>
            </div>
          </div>

          {/* Resultados Recientes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Resultados Recientes</h3>
              <Link to="/Historial" className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm"> Ver Historial Completo </Link>
            </div>

            <div className="space-y-4">
              {/* Resultado 1 */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Derecho Constitucional</h4>
                    <p className="text-sm text-gray-500">Publicado: 05 de Octubre</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#003366]">4.5</div>
              </div>

              {/* Resultado 2 */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Teoría General del Proceso</h4>
                    <p className="text-sm text-gray-500">Publicado: 01 de Octubre</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#003366]">6.0</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default EstudianteDashboard;
