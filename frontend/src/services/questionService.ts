import api from '../api/axios.config';

export interface Question {
    id_question: number;
    question_text: string;
    answer: string;
    category_id?: number;
    theme_id: number;
}

// Deprecated - kept for backwards compatibility
export const getRandomQuestions = async (categoryId: number): Promise<Question[]> => {
    const response = await api.get(`/questions/random/${categoryId}`);
    return response.data;
};

// New function to get questions by theme
export const getQuestionsByTheme = async (themeId: number): Promise<Question[]> => {
    const response = await api.get(`/questions/by-theme/${themeId}`);
    return response.data;
};

