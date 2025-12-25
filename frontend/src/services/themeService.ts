import api from '../api/axios.config';

export interface Theme {
    theme_id: number;
    theme_name: string;
    subject_id: string;
}

export const getThemesBySubject = async (subjectId: number): Promise<Theme[]> => {
    const response = await api.get(`/theme/by-subject/${subjectId}`);
    return response.data;
};

export const getAllThemes = async (): Promise<Theme[]> => {
    const response = await api.get('/theme');
    return response.data;
};
