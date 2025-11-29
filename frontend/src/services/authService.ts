import api from '../api/axios.config';
import { AuthResponse, LoginCredentials, User } from '../types/auth.types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    
    // El backend devuelve: { success: true, data: { user, token } }
    const { data } = response.data;
    const { token, user } = data;
    
    // Mapear el usuario del backend al formato del frontend
    const mappedUser: User = {
      id: user.id.toString(),
      name: `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario',
      rut: user.rut,
      role: this.mapRole(user.rol)
    };
    
    // Guardar el token en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    
    return { token, user: mappedUser };
  }

  private mapRole(rol: string): 'Estudiante' | 'Profesor' | 'Administrador' {
    const roleMap: { [key: string]: 'Estudiante' | 'Profesor' | 'Administrador' } = {
      'estudiante': 'Estudiante',
      'profesor': 'Profesor',
      'administrador': 'Administrador'
    };
    
    return roleMap[rol.toLowerCase()] || 'Estudiante';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
