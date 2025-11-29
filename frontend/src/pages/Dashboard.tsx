import { useAuth } from '../hooks/useAuth';
import EstudianteDashboard from '../components/dashboards/EstudianteDashboard.tsx';
import ProfesorDashboard from '../components/dashboards/ProfesorDashboard.tsx';
import AdministradorDashboard from '../components/dashboards/AdministradorDashboard.tsx';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {user.role === 'Estudiante' && <EstudianteDashboard user={user} />}
      {user.role === 'Profesor' && <ProfesorDashboard user={user} />}
      {user.role === 'Administrador' && <AdministradorDashboard user={user} />}
    </div>
  );
};

export default Dashboard;
