import apiClient from '../api/axios.config';

export type EvaluationDetail = {
  evaluation_detail_id: number;
  user_id: number;
  commission_id: number;
  guidline_id: number;
  observation?: string;
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
 * Actualiza una evaluación con puntaje y observaciones
 * @param evaluationDetailId ID de la evaluación
 * @param data Objeto con grade y observation
 * @returns Promesa que resuelve a la evaluación actualizada
 */
export const updateEvaluation = async (
  evaluationDetailId: number,
  data: { grade?: number; observation?: string; status?: string }
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
