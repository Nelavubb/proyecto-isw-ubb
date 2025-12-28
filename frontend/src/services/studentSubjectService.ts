import api from '../api/axios.config';

export interface StudentSubject {
    student_subject_id: number;
    user_id: number;
    subject_id: number;
    status: 'active' | 'inactive';
}

export const getAllStudentSubjects = async (): Promise<StudentSubject[]> => {
    const response = await api.get('/student-subjects');
    return response.data;
};

export const enrollStudent = async (data: { user_id: number; subject_id: number; status: 'active' | 'inactive' }): Promise<StudentSubject> => {
    const response = await api.post('/student-subjects', data);
    return response.data;
};

export const removeStudentFromSubject = async (subjectId: number, userId: number): Promise<void> => {
    await api.delete(`/student-subjects/${subjectId}/${userId}`);
};

export const updateStudentSubjectStatus = async (subjectId: number, userId: number, status: 'active' | 'inactive'): Promise<StudentSubject> => {
    const response = await api.put(`/student-subjects/${subjectId}/${userId}`, { status });
    return response.data;
};
