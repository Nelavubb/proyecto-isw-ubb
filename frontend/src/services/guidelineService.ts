import api from '../api/axios.config';

export interface Criterion {
    criterion_id?: number;
    description: string;
    scor_max: number;
}

export interface Guideline {
    guidline_id?: number;
    name: string;
    theme_id: number;
    themeName?: string;
    description?: Criterion[];
}

export const getGuidelines = async (): Promise<Guideline[]> => {
    const response = await api.get('/guidelines');
    return response.data;
};

export const getGuidelinesByTheme = async (themeId: number): Promise<Guideline[]> => {
    const response = await api.get('/guidelines');
    const allGuidelines = response.data;
    return allGuidelines.filter((g: Guideline) => g.theme_id === themeId);
};

export const getGuidelineById = async (id: number): Promise<Guideline> => {
    const response = await api.get(`/guidelines/${id}`);
    return response.data;
};

export const createGuideline = async (guidelineData: {
    name: string;
    theme_id: number;
    description: Criterion[];
}): Promise<Guideline> => {
    const response = await api.post('/guidelines', guidelineData);
    return response.data;
};

export const updateGuideline = async (
    id: number,
    guidelineData: {
        name: string;
        theme_id: number;
        description: Criterion[];
    }
): Promise<Guideline> => {
    const response = await api.put(`/guidelines/${id}`, guidelineData);
    return response.data;
};

export const deleteGuideline = async (id: number): Promise<void> => {
    await api.delete(`/guidelines/${id}`);
};
