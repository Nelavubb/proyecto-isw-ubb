import { useEffect, useState } from 'react';
import { User } from '../../types/auth.types';
import Header from '../Header.tsx';
import BottomNavigation from '../BottomNavigation';
import { Link, useNavigate } from 'react-router-dom';
import { getCommissions, Commission } from '../../services/commissionService';
import { getAllSubjects } from '../../services/subjectService';

// Extender Commission para incluir nombre de asignatura
interface CommissionConAsignatura extends Commission {
  subjectName?: string;
}

interface ProfesorDashboardProps {
  user: User;
}

const ProfesorDashboard = ({ user }: ProfesorDashboardProps) => {
  const navigate = useNavigate();
  const [comisionesPendientes, setComisionesPendientes] = useState<CommissionConAsignatura[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para navegar a realizar evaluación
  const handleRealizarEvaluacion = (comision: CommissionConAsignatura) => {
    // Buscar el primer estudiante con rol "Estudiante"
    const estudianteValido = comision.estudiantes?.find(e => e.role?.toLowerCase() === 'estudiante');
    if (estudianteValido) {
      navigate(`/RealizarEvaluacion?commission_id=${comision.commission_id}&theme_id=${comision.theme_id}&user_id=${estudianteValido.user_id}`);
    } else if (comision.estudiantes && comision.estudiantes.length > 0) {
      // Si no tiene rol específico, usar el primer estudiante
      navigate(`/RealizarEvaluacion?commission_id=${comision.commission_id}&theme_id=${comision.theme_id}&user_id=${comision.estudiantes[0].user_id}`);
    } else {
      alert('No hay estudiantes asignados a esta comisión');
    }
  };

  useEffect(() => {
    const cargarComisiones = async () => {
      try {
        // Obtener comisiones del profesor actual
        const comisiones = await getCommissions({ userId: user.id });
        
        // Cargar asignaturas para obtener los nombres
        const subjectsData = await getAllSubjects();
        
        // Crear mapa de subject_id -> subject_name
        const subjectMap = new Map<number, string>();
        for (const subject of subjectsData) {
          subjectMap.set(Number(subject.subject_id), subject.subject_name);
        }
        
        // Filtrar solo las pendientes (no finalizadas) y agregar nombre de asignatura
        // Usar el subject_id que viene en el theme de cada comisión
        const pendientes = comisiones
          .filter(c => !c.finalizada)
          .map(c => ({
            ...c,
            subjectName: c.theme?.subject_id 
              ? subjectMap.get(Number(c.theme.subject_id)) || 'Sin asignatura'
              : 'Sin asignatura'
          }));
        
        // Ordenar por fecha más próxima
        pendientes.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        setComisionesPendientes(pendientes);
      } catch (error) {
        console.error('Error al cargar comisiones:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarComisiones();
  }, [user.id]);

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: string, hora: string) => {
    const date = new Date(`${fecha}T${hora}`);
    const opciones: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-CL', opciones);
  };

  // Determinar si la comisión está próxima (dentro de 7 días)
  const esProxima = (fecha: string) => {
    const hoy = new Date();
    const fechaComision = new Date(fecha);
    const diffTime = fechaComision.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <>
      <Header variant="dashboard" />

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 -mt-36 pb-24">
        {/* Welcome Section */}
        <div className="mb-6 text-white">
          <h2 className="text-3xl font-bold">Bienvenido(a), {user.name}</h2>  
        </div>

        {/* Comisiones a Evaluar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Comisiones a Evaluar</h3>
            <Link 
              to="/comisiones" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : comisionesPendientes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p>No tienes comisiones pendientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comisionesPendientes.slice(0, 3).map((comision) => (
                <div 
                  key={comision.commission_id}
                  onClick={() => handleRealizarEvaluacion(comision)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {comision.theme?.theme_name || 'Sin tema'} - {comision.commission_name?.split(' - ')[0] || 'Comisión'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {comision.subjectName || 'Sin asignatura'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {comision.totalEstudiantes || comision.estudiantes?.length || 0} estudiantes • {formatearFecha(comision.date, comision.time)}
                      </p>
                    </div>
                  </div>
                  {esProxima(comision.date) ? (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                      Próxima
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      Programada
                    </span>
                  )}
                </div>
              ))}
              
              {comisionesPendientes.length > 3 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Y {comisionesPendientes.length - 3} comisión(es) más...
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Gestionar Evaluaciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Gestionar Evaluaciones</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="text-gray-800 font-medium">Ver y gestionar evaluaciones.</span>
                </div>
                <Link to="/evaluaciones" className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm">
                  Gestionar
                </Link>
              </div>
            </div>
          </div>

          {/* Gestionar Asignaturas */}
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
      </main>

      <BottomNavigation />
    </>
  );
};

export default ProfesorDashboard;
