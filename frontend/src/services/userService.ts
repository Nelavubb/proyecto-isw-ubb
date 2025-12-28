import api from '../api/axios.config';

export interface User {
    user_id: number;
    id?: number; // Para compatibilidad
    rut: string;
    user_name: string;
    role: string;
    email?: string;
}

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
};

export const createUser = async (userData: { rut: string; user_name: string; role: string; password?: string }): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
};

export const updateUser = async (userId: number, userData: { rut?: string; user_name?: string; role?: string }): Promise<User> => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
};
