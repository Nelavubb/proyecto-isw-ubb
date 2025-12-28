import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Evaluaciones from "./pages/Evaluaciones";
import Practice from "./pages/Practice";
import RealizacionEvaluacion from "./pages/RealizarEvaluacion";
import SubjectSelect from "./pages/SubjectSelect";
import ThemeSelect from "./pages/ThemeSelect";
import Comisiones from "./pages/Comisiones";
import AddGuidelines from "./pages/AddGuidelines";
import SubjectSelectionTeacher from "./pages/SubjectSelectionTeacher";
import SubjectSelectionAdmin from "./pages/SubjectSelectionAdmin";
import SubjectDetailsAdmin from "./pages/SubjectDetailsAdmin";
import Users from "./pages/Users";
import HistorySubjectSelect from "./pages/HistorySubjectSelect";
import HistoryEvaluationList from "./pages/HistoryEvaluationList";
import HistoryEvaluationDetail from "./pages/HistoryEvaluationDetail";
import ThemeQuestionManager from "./pages/ThemeQuestionManager";

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mientras carga, mostrar nada para evitar flash de contenido
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Componente para rutas públicas (redirige al dashboard si ya está autenticado)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mientras carga, mostrar nada
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }
  
  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Rutas Protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluaciones"
            element={
              <ProtectedRoute>
                <Evaluaciones />
              </ProtectedRoute>
            }
          />

          {/* Realización de evaluación */}
          <Route
            path="/RealizarEvaluacion"
            element={
              <ProtectedRoute>
                <RealizacionEvaluacion />
              </ProtectedRoute>
            }
          />

          {/* Práctica - Nuevo flujo de 3 pasos */}
          <Route
            path="/practice/subjects"
            element={
              <ProtectedRoute>
                <SubjectSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/themes/:subjectId"
            element={
              <ProtectedRoute>
                <ThemeSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/quiz/:themeId"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />


          {/* Historial de Evaluaciones - Flujo de 3 pasos */}
          <Route
            path="/history/subjects"
            element={
              <ProtectedRoute>
                <HistorySubjectSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history/evaluations/:subjectId/:semester"
            element={
              <ProtectedRoute>
                <HistoryEvaluationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history/detail/:evaluationDetailId"
            element={
              <ProtectedRoute>
                <HistoryEvaluationDetail />
              </ProtectedRoute>
            }
          />

          {/* Redirect old Historial route to new flow */}
          <Route
            path="/Historial"
            element={<Navigate to="/history/subjects" />}
          />

          {/* Gestión de Comisiones */}
          <Route
            path="/comisiones"
            element={
              <ProtectedRoute>
                <Comisiones />
              </ProtectedRoute>
            }
          />

          {/* Crear/Editar Pauta de Evaluación */}
          <Route
            path="/add-guidelines"
            element={
              <ProtectedRoute>
                <AddGuidelines />
              </ProtectedRoute>
            }
          />

          {/* Gestión de Asignaturas */}
          <Route
            path="/gestion-asignaturas"
            element={
              <ProtectedRoute>
                <SubjectSelectionTeacher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gestion-asignaturas/:subjectId"
            element={
              <ProtectedRoute>
                <ThemeQuestionManager />
              </ProtectedRoute>
            }
          />


          {/* Admin: Gestión de Asignaturas */}
          <Route
            path="/admin/subjects"
            element={
              <ProtectedRoute>
                <SubjectSelectionAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects/:id"
            element={
              <ProtectedRoute>
                <SubjectDetailsAdmin />
              </ProtectedRoute>
            }
          />

          {/* Gestión de Usuarios */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
