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
