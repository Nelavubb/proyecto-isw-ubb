import api from '../api/axios.config';

export interface DashboardStats {
    studentsCount: number;
    teachersCount: number;
    activeCommissionsCount: number;
    evaluationsThisMonth: number;
}

export interface RecentActivity {
    id: string;
    type: 'commission' | 'evaluation' | 'user';
    title: string;
    description: string;
    date: string;
    icon: 'calendar' | 'check' | 'user';
}

/**
 * Obtiene las estadísticas generales del dashboard
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

/**
 * Obtiene la actividad reciente del sistema (últimos 5 eventos)
 */
export const getRecentActivity = async (): Promise<RecentActivity[]> => {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
};

/**
 * Formatea una fecha relativa (hace X tiempo)
 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-CL', { 
        day: 'numeric', 
        month: 'short', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
};
