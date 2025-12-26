import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Evaluaciones from "./pages/Evaluaciones";
import Practice from "./pages/Practice";
import RealizacionEvaluacion from "./pages/RealizarEvaluacion";
import Historial from "./pages/Historial";
import SubjectSelect from "./pages/SubjectSelect";
import ThemeSelect from "./pages/ThemeSelect";
import QuestionBank from "./pages/QuestionBank";
import AddQuestion from "./pages/AddQuestion";
import Comisiones from "./pages/Comisiones";
import AddGuidelines from "./pages/AddGuidelines";
import GestionTemas from "./pages/GestionTemas";
import Users from "./pages/Users";

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Temporalmente comentado hasta que tengas authService
  // return authService.isAuthenticated() ? children : <Navigate to="/" />;
  return children; // Temporal
};

// Componente para rutas públicas (redirige al dashboard si ya está autenticado)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  // Temporalmente comentado hasta que tengas authService
  // return !authService.isAuthenticated() ? children : <Navigate to="/dashboard" />;
  return children; // Temporal
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

          <Route
            path="/Historial"
            element={
              <ProtectedRoute>
                <Historial />
              </ProtectedRoute>
            }
          />

          {/* Banco de Preguntas */}
          <Route
            path="/QuestionBank"
            element={
              <ProtectedRoute>
                <QuestionBank />
              </ProtectedRoute>
            }
          />

          {/* Agregar Pregunta */}
          <Route
            path="/AddQuestion"
            element={
              <ProtectedRoute>
                <AddQuestion />
              </ProtectedRoute>
            }
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

          {/* Gestión de Temas */}
          <Route
            path="/gestion-temas"
            element={
              <ProtectedRoute>
                <GestionTemas />
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

