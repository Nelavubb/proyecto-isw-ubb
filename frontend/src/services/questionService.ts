import api from '../api/axios.config';

export interface Question {
    id_question: number;
    question_text: string;
    answer: string;
    category_id?: number;
    theme_id: number;
    user_id: number;
    user?: {
        user_name: string;
    };
    created_at?: string;
    updated_at?: string;
}

// Deprecated - kept for backwards compatibility
export const getRandomQuestions = async (categoryId: number): Promise<Question[]> => {
    const response = await api.get(`/questions/random/${categoryId}`);
    return response.data;
};

export const getAllQuestions = async (limit: number): Promise<Question[]> => {
    const response = await api.get(`/questions/all/${limit}`);
    return response.data;
};

// New function to get questions by theme
export const getQuestionsByTheme = async (themeId: number): Promise<Question[]> => {
    const response = await api.get(`/questions/by-theme/${themeId}`);
    return response.data;
};

export const createQuestion = async (questionData: { question_text: string; answer: string; theme_id: number; user_id?: number; }): Promise<Question> => {
    const response = await api.post('/questions/create', questionData);
    return response.data;
};

export const getQuestionById = async (id: number): Promise<Question> => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
};

export const updateQuestion = async (id: number, questionData: { question_text: string; answer: string; theme_id: number; }): Promise<Question> => {
    const response = await api.put(`/questions/update/${id}`, questionData);
    return response.data;
};
