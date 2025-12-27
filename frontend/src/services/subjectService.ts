import api from '../api/axios.config';

export interface Subject {
    subject_id: number;
    subject_name: string;
    user_id: number;
}

export const getAllSubjects = async (): Promise<Subject[]> => {
    const response = await api.get('/subjects');
    return response.data;
};

export const getEnrolledSubjects = async (userId: number): Promise<Subject[]> => {
    const response = await api.get(`/subjects/enrolled/${userId}`);
    return response.data;
};

export const getSubjectsByUser = async (userId: number): Promise<Subject[]> => {
    const response = await api.get(`/subjects/by-user/${userId}`);
    return response.data;
};

export const createSubject = async (data: { subject_name: string; user_id: number }): Promise<Subject> => {
    const response = await api.post('/subjects', data);
    return response.data;
};

export const updateSubject = async (id: number, data: { subject_name: string; user_id: number }): Promise<Subject> => {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data;
};

export const deleteSubject = async (id: number): Promise<void> => {
    await api.delete(`/subjects/${id}`);
};
