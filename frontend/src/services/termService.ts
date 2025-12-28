import api from '../api/axios.config';

export interface Term {
    term_id: number;
    code: string;
    is_current: boolean;
}

export const getAllTerms = async (): Promise<Term[]> => {
    const response = await api.get('/terms');
    return response.data;
};


export const createTerm = async (data: { code: string; is_current: boolean }): Promise<Term> => {
    const response = await api.post('/terms', data);
    return response.data;
};

export const setCurrentTerm = async (termId: number): Promise<Term> => {
    const response = await api.put(`/terms/${termId}/current`);
    return response.data;
};
