import api from '../api/axios.config';

export interface SubjectHistory {
    student_subject_id: number;
    subject_id: number;
    subject_name: string;
    semester: string;
}

export interface EvaluationSummary {
    evaluation_detail_id: number;
    commission_name: string;
    date: string;
    grade: number;
    theme_name: string;
}

export interface CriterionScore {
    criterion_id: number;
    description: string;
    actual_score: number;
    max_score: number;
}

export interface EvaluationDetail {
    evaluation_detail_id: number;
    grade: number;
    observation: string;
    scores: CriterionScore[];
}

export interface RecentEvaluation {
    evaluation_detail_id: number;
    subject_name: string;
    date: string;
    grade: number;
}

export const getSubjectHistory = async (userId: number): Promise<SubjectHistory[]> => {
    const response = await api.get(`/history/subjects/${userId}`);
    return response.data;
};

export const getEvaluationsBySubject = async (
    userId: number, 
    subjectId: number, 
    semester: string
): Promise<EvaluationSummary[]> => {
    const response = await api.get(`/history/evaluations/${userId}/${subjectId}/${semester}`);
    return response.data;
};

export const getEvaluationDetail = async (evaluationDetailId: number): Promise<EvaluationDetail> => {
    const response = await api.get(`/history/detail/${evaluationDetailId}`);
    return response.data;
};

export const getRecentEvaluations = async (userId: number): Promise<RecentEvaluation[]> => {
    const response = await api.get(`/history/recent/${userId}`);
    return response.data;
};
