import apiClient from '../api/axios.config';

export type EvaluationDetail = {
  evaluation_detail_id: number;
  user_id: number;
  commission_id: number;
  guidline_id: number;
  observation?: string;
  question_asked?: string;
  grade?: number;
  status: string;
  created_at?: string;
};

/**
 * Obtiene las evaluaciones pendientes para un usuario (profesor)
 * @param userId ID del profesor (opcional, si no se proporciona usa el del contexto)
 * @returns Promesa que resuelve a un array de evaluaciones pendientes
 */
export const getEvaluationsPending = async (userId?: number): Promise<EvaluationDetail[]> => {
  try {
    const params = userId ? { userId } : {};
    const response = await apiClient.get<EvaluationDetail[]>('/evaluation-details/pending', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending evaluations:', error);
    throw error;
  }
};

/**
 * Obtiene una evaluación por ID
 * @param evaluationDetailId ID de la evaluación
 * @returns Promesa que resuelve a la evaluación con datos de la pauta
 */
export const getEvaluationById = async (evaluationDetailId: number): Promise<EvaluationDetail> => {
  try {
    const response = await apiClient.get<EvaluationDetail>(`/evaluation-details/${evaluationDetailId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    throw error;
  }
};

/**
 * Crea una nueva evaluación
 * @param data Objeto con user_id, commission_id, guidline_id
 * @returns Promesa que resuelve a la evaluación creada
 */
export const createEvaluation = async (
  data: {
    user_id: number;
    commission_id: number;
    guidline_id: number;
    status?: string;
  }
): Promise<EvaluationDetail> => {
  try {
    const response = await apiClient.post<EvaluationDetail>('/evaluation-details', data);
    return response.data;
  } catch (error) {
    console.error('Error creating evaluation:', error);
    throw error;
  }
};

/**
 * Actualiza una evaluación con puntaje y observaciones
 * @param evaluationDetailId ID de la evaluación
 * @param data Objeto con grade, observation y scores
 * @returns Promesa que resuelve a la evaluación actualizada
 */
export const updateEvaluation = async (
  evaluationDetailId: number,
  data: { 
    grade?: number; 
    observation?: string; 
    question_asked?: string;
    status?: string;
    scores?: Array<{ criterion_id: number; actual_score: number }>;
  }
): Promise<EvaluationDetail> => {
  try {
    const response = await apiClient.put<EvaluationDetail>(
      `/evaluation-details/${evaluationDetailId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error updating evaluation:', error);
    throw error;
  }
};

/**
 * Finaliza una evaluación (cambia estado a 'completed')
 * @param evaluationDetailId ID de la evaluación
 * @returns Promesa que resuelve a la evaluación actualizada
 */
export const completeEvaluation = async (evaluationDetailId: number): Promise<EvaluationDetail> => {
  try {
    const response = await apiClient.put<EvaluationDetail>(
      `/evaluation-details/${evaluationDetailId}`,
      { status: 'completed' }
    );
    return response.data;
  } catch (error) {
    console.error('Error completing evaluation:', error);
    throw error;
  }
};

// Interfaz para los resultados de evaluación por comisión
export interface CommissionResult {
  evaluation_detail_id: number;
  student: {
    user_id: number;
    user_name: string;
    rut: string;
  } | null;
  grade: number | null;
  observation: string | null;
  question_asked: string | null;
  status: string;
  scores: Array<{
    criterion_id: number;
    criterion_name: string;
    max_score: number;
    actual_score: number;
  }>;
}

/**
 * Obtiene los resultados de evaluación de todos los estudiantes de una comisión
 * @param commissionId ID de la comisión
 * @returns Promesa que resuelve a un array de resultados
 */
export const getCommissionResults = async (commissionId: number): Promise<CommissionResult[]> => {
  try {
    const response = await apiClient.get<CommissionResult[]>(`/evaluation-details/by-commission/${commissionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching commission results:', error);
    throw error;
  }
};
