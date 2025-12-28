import api from '../api/axios.config';

export interface Estudiante {
    user_id: number;
    user_name: string;
    rut: string;
    role?: string;
    status?: 'pending' | 'completed';
}

export interface Commission {
    commission_id: number;
    commission_name: string;
    user_id: number;
    theme_id: number;
    date: string;
    time: string;
    location: string;
    evaluation_group: string;
    theme?: {
        theme_id: number;
        theme_name: string;
    };
    estudiantes?: Estudiante[];
    totalEstudiantes?: number;
    finalizada?: boolean;
}

export interface CreateCommissionData {
    commission_name: string;
    user_id: number;
    theme_id: number;
    guideline_id?: number;
    date: string;
    time: string;
    location: string;
    evaluation_group: string;
    estudiantes?: number[]; // array de user_ids
}

// Obtener todas las comisiones (con filtros opcionales)
export const getCommissions = async (filters?: { userId?: number; themeId?: number }): Promise<Commission[]> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId.toString());
    if (filters?.themeId) params.append('themeId', filters.themeId.toString());
    
    const response = await api.get(`/commissions?${params.toString()}`);
    return response.data;
};

// Obtener una comisión por ID
export const getCommissionById = async (id: number): Promise<Commission> => {
    const response = await api.get(`/commissions/${id}`);
    return response.data;
};

// Obtener comisiones por tema
export const getCommissionsByTheme = async (themeId: number): Promise<Commission[]> => {
    const response = await api.get(`/commissions/by-theme/${themeId}`);
    return response.data;
};

// Crear una nueva comisión
export const createCommission = async (data: CreateCommissionData): Promise<Commission> => {
    const response = await api.post('/commissions', data);
    return response.data;
};

// Actualizar una comisión
export const updateCommission = async (id: number, data: Partial<CreateCommissionData>): Promise<Commission> => {
    const response = await api.put(`/commissions/${id}`, data);
    return response.data;
};

// Eliminar una comisión
export const deleteCommission = async (id: number): Promise<void> => {
    await api.delete(`/commissions/${id}`);
};

// Obtener estudiantes por asignatura
export const getStudentsBySubject = async (subjectId: number): Promise<Estudiante[]> => {
    const response = await api.get(`/users/students/by-subject/${subjectId}`);
    return response.data;
};

// Obtener todos los estudiantes
export const getAllStudents = async (): Promise<Estudiante[]> => {
    const response = await api.get('/users/students');
    return response.data;
};
