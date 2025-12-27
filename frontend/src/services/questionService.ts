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
    difficulty?: string;
}

export const getAllQuestions = async (limit: number): Promise<Question[]> => {
    const response = await api.get(`/questions/all/${limit}`);
    return response.data;
};

// New function to get questions by theme
export const getQuestionsByTheme = async (themeId: number, difficulty?: string): Promise<Question[]> => {
    let url = `/questions/by-theme/${themeId}`;
    if (difficulty && difficulty !== 'all') {
        url += `?difficulty=${difficulty}`;
    }
    const response = await api.get(url);
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

export const updateQuestion = async (id: number, questionData: { question_text: string; answer: string; theme_id: number; difficulty?: string; }): Promise<Question> => {
    const response = await api.put(`/questions/update/${id}`, questionData);
    return response.data;
};
export const deleteQuestion = async (id: number): Promise<void> => {
    await api.delete(`/questions/delete/${id}`);
};
