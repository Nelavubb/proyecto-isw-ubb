import api from '../api/axios.config';

export interface Category {
    id_category: number;
    name: string;
    description: string;
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
};
