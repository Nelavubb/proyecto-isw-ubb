import api from '../api/axios.config';

export interface Question {
    id_question: number;
    question_text: string;
    answer: string;
    category_id: number;
}

export const getRandomQuestions = async (categoryId: number): Promise<Question[]> => {
    const response = await api.get(`/questions/random/${categoryId}`);
    return response.data;
};

export const getAllQuestions = async (limit: number): Promise<Question[]> => {
    const response = await api.get(`/questions/all/${limit}`);
    return response.data;
};