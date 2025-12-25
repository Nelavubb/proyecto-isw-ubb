import api from '../api/axios.config';

export interface Subject {
    subject_id: number;
    subject_name: string;
    user_id: number;
}

export const getEnrolledSubjects = async (userId: number): Promise<Subject[]> => {
    const response = await api.get(`/subjects/enrolled/${userId}`);
    return response.data;
};
