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

export const createTheme = async (themeData: { theme_name: string; subject_id: number }): Promise<Theme> => {
    const response = await api.post('/theme/create', themeData);
    return response.data;
};

export const updateTheme = async (id: number, themeData: { theme_name: string }): Promise<Theme> => {
    const response = await api.put(`/theme/update/${id}`, themeData);
    return response.data;
};

export const deleteTheme = async (id: number): Promise<void> => {
    await api.delete(`/theme/delete/${id}`);
};
