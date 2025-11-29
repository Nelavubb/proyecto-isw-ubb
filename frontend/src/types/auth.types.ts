export interface User {
  id: string;
  name: string;
  rut: string;
  role: 'Estudiante' | 'Profesor' | 'Administrador';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  rut: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginDev: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
