import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { getEvaluationsPending, updateEvaluation, completeEvaluation, createEvaluation, EvaluationDetail } from '../services/evaluationService';
import { getAllQuestions } from '../services/questionService';
import { getGuidelinesByTheme } from '../services/guidelineService';
import { getCommissionById, Estudiante, Commission, EvaluacionResumen } from '../services/commissionService';

type Question = { id: string; text: string; topic: string };

type Criterion = {
  criterion_id: number;
  description: string;
  scor_max: number;
  score: number | null;
};

type EvaluacionPendiente = EvaluationDetail & {
  user?: {
    user_id: number;
    user_name: string;
  };
  commission?: {
    commission_id: number;
    commission_name: string;
  };
  guidline?: {
    guidline_id: number;
    name: string;
    theme?: {
      theme_id: number;
      theme_name: string;
    };
  };
  criteria?: any[];
  scores?: Array<{
    score_id: number;
    criterion_id: number;
    actual_score: number;
    evaluation_detail_id: number;
  }>;
};

type EstudianteConEstado = Estudiante & {
  evaluation_status?: string;
  evaluation_detail_id?: number;
};

export default function RealizacionEvaluacion() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Obtener parámetros de la URL
  const evaluationDetailId = searchParams.get('evaluation_detail_id');
  const commissionId = searchParams.get('commission_id');
  const themeId = searchParams.get('theme_id');
  const userId = searchParams.get('user_id');

  // Estados principales
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<EvaluacionPendiente | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGuideline, setLoadingGuideline] = useState(false);

  // Estados para selector de estudiantes
  const [estudiantes, setEstudiantes] = useState<EstudianteConEstado[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showStudentSelector, setShowStudentSelector] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [commissionData, setCommissionData] = useState<Commission | null>(null);

  // Estados de evaluación
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackCharCount, setFeedbackCharCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [toast, setToast] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);

  const FEEDBACK_MAX_CHARS = 500;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData();
  }, [commissionId, themeId]);

  // Cargar estudiantes de la comisión
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Validar que tengamos los parámetros necesarios
      if (!themeId || !commissionId) {
        setToast({ type: 'error', text: 'Parámetros inválidos. Por favor, vuelve a Comisiones.' });
        setTimeout(() => navigate('/comisiones'), 2000);
        return;
      }

      // Cargar datos de la comisión (incluye estudiantes y evaluaciones)
      const commission = await getCommissionById(parseInt(commissionId));
      setCommissionData(commission);

      // Mapear estudiantes con su estado de evaluación
      const estudiantesConEstado: EstudianteConEstado[] = (commission.estudiantes || []).map((est: Estudiante) => {
        const evaluacion = commission.evaluaciones?.find((ev: EvaluacionResumen) => ev.user_id === est.user_id);
        return {
          ...est,
          evaluation_status: evaluacion?.status || 'pending',
          evaluation_detail_id: evaluacion?.evaluation_detail_id
        };
      });

      // Ordenar: primero los pendientes, después los completados
      const ordenados = estudiantesConEstado.sort((a, b) => {
        if (a.evaluation_status === 'completed' && b.evaluation_status !== 'completed') return 1;
        if (a.evaluation_status !== 'completed' && b.evaluation_status === 'completed') return -1;
        return 0;
      });

      setEstudiantes(ordenados);

      // Cargar banco de preguntas
      try {
        const allQuestions = await getAllQuestions(1000);
        setQuestionBank(allQuestions.map(q => ({
          id: String(q.id_question),
          text: q.question_text,
          topic: q.theme_id ? String(q.theme_id) : 'Unknown'
        })));
      } catch (error) {
        console.warn('No se pudieron cargar las preguntas:', error);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setToast({ type: 'error', text: 'Error al cargar la comisión' });
    } finally {
      setLoading(false);
    }
  };

  // Cargar evaluación cuando se selecciona un estudiante
  const loadStudentEvaluation = async (studentId: number) => {
    try {
      setLoadingStudents(true);
      setShowStudentSelector(false);
      setSelectedStudentId(studentId);

      // Resetear estados de evaluación anterior
      setCriteria([]);
      setCurrentQuestion(null);
      setFeedback('');
      setFeedbackCharCount(0);
      setCompleted(false);
      setSaved(false);

      // Cargar la pauta para obtener el guidline_id
      let guidelineData: any = null;
      try {
        const guidelines = await getGuidelinesByTheme(parseInt(themeId!));
        if (guidelines && guidelines.length > 0) {
          guidelineData = guidelines[0];
        }
      } catch (error) {
        console.warn('No se pudo cargar la pauta:', error);
      }

      // Cargar las evaluaciones pendientes
      const evaluaciones = await getEvaluationsPending();
      
      // Buscar evaluación para este estudiante específico en esta comisión
      let evalBase = evaluaciones.find(e => 
        e.commission_id === parseInt(commissionId!) && e.user_id === studentId
      );
      
      // Si no hay evaluación pendiente para este estudiante, crear una
      if (!evalBase && guidelineData) {
        try {
          console.log('Creando nueva evaluación para estudiante ID:', studentId);
          const newEvaluation = await createEvaluation({
            user_id: studentId,
            commission_id: parseInt(commissionId!),
            guidline_id: guidelineData.guidline_id,
            status: 'pending'
          });
          console.log('Evaluación creada:', newEvaluation);
          evalBase = newEvaluation;
        } catch (error) {
          console.error('Error creando evaluación:', error);
          setToast({ type: 'error', text: 'Error al preparar la evaluación.' });
          setShowStudentSelector(true);
          return;
        }
      }

      if (!evalBase) {
        console.warn('No se encontró evaluación pendiente para estudiante:', studentId);
        setToast({ type: 'error', text: 'No se pudo cargar la evaluación para este estudiante.' });
        setShowStudentSelector(true);
        return;
      }

      // Castear a tipo completo
      const evaluation = evalBase as EvaluacionPendiente;

      // Usar la pauta ya cargada anteriormente o cargarla si no existe
      try {
        setLoadingGuideline(true);
        const guideline = guidelineData;
        if (guideline) {
          console.log('Pauta seleccionada:', guideline);
          console.log('Criterios de la pauta:', guideline.description);
          // Enriquecer la evaluación con los criterios de la pauta
          evaluation.criteria = guideline.description || [];
          evaluation.guidline = {
            guidline_id: guideline.guidline_id || 0,
            name: guideline.name,
            theme: {
              theme_id: guideline.theme_id,
              theme_name: (guideline as any).theme?.theme_name || ''
            }
          };
        } else {
          console.warn('No se encontraron pautas para el tema:', themeId);
        }
      } catch (error) {
        console.warn('No se pudo cargar la pauta:', error);
      } finally {
        setLoadingGuideline(false);
      }

      // Agregar información del estudiante
      const estudianteInfo = estudiantes.find(e => e.user_id === studentId);
      if (estudianteInfo) {
        evaluation.user = {
          user_id: estudianteInfo.user_id,
          user_name: estudianteInfo.user_name
        };
      }

      // Agregar información de la comisión
      if (commissionData) {
        evaluation.commission = {
          commission_id: commissionData.commission_id,
          commission_name: commissionData.commission_name
        };
      }

      setEvaluacionSeleccionada(evaluation);

      // Cargar observaciones existentes si las hay
      if (evaluation.observation) {
        setFeedback(evaluation.observation);
        setFeedbackCharCount(evaluation.observation.length);
      }

      // Cargar criterios de la pauta con puntajes existentes
      if (evaluation.criteria && Array.isArray(evaluation.criteria) && evaluation.criteria.length > 0) {
        const loadedCriteria = evaluation.criteria.map((crit: any) => {
          // Buscar si existe un score guardado para este criterio
          const existingScore = evaluation.scores?.find(
            (s: any) => s.criterion_id === crit.criterion_id
          );
          return {
            criterion_id: crit.criterion_id,
            description: crit.description,
            scor_max: crit.scor_max || 5,
            score: existingScore ? existingScore.actual_score : null,
          };
        });
        setCriteria(loadedCriteria);
      } else {
        setCriteria([]);
      }

      // Cargar pregunta existente si hay question_asked
      if (evaluation.question_asked) {
        setCurrentQuestion({
          id: 'saved',
          text: evaluation.question_asked,
          topic: themeId || ''
        });
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setToast({ type: 'error', text: 'Error al cargar la evaluación' });
      setShowStudentSelector(true);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Volver al selector de estudiantes después de registrar evaluación
  const handleBackToStudentSelector = async () => {
    // Recargar datos para actualizar estados de evaluación
    await loadInitialData();
    setShowStudentSelector(true);
    setEvaluacionSeleccionada(null);
    setSelectedStudentId(null);
  };
  const partialTotal = useMemo(() => {
    return criteria.reduce((sum, c) => sum + (c.score ?? 0), 0);
  }, [criteria]);

  const maxTotal = useMemo(() => {
    return criteria.reduce((sum, c) => sum + c.scor_max, 0);
  }, [criteria]);

  // Función para calcular la nota de 1-7 basada en el porcentaje
  // 51% de exigencia para nota 4.0 (aprobación)
  const calculateFinalGrade = (totalScore: number, maxScore: number): number => {
    if (maxScore === 0) return 1;
    
    const percentage = totalScore / maxScore;
    
    if (percentage < 0.51) {
      // Mapea 0-51% a notas 1.0-4.0
      return 1 + (percentage / 0.51) * 3;
    } else {
      // Mapea 51-100% a notas 4.0-7.0
      return 4 + ((percentage - 0.51) / 0.49) * 3;
    }
  };

  // Nota calculada automáticamente
  const notaCalculada = useMemo(() => {
    return calculateFinalGrade(partialTotal, maxTotal);
  }, [partialTotal, maxTotal]);

  const pautaExiste = evaluacionSeleccionada && evaluacionSeleccionada.criteria && evaluacionSeleccionada.criteria.length > 0;

  const generateRandomQuestion = () => {
    // Obtener el theme_id de la evaluación para filtrar preguntas
    const currentThemeId = themeId || evaluacionSeleccionada?.guidline?.theme?.theme_id?.toString();
    
    if (!currentThemeId) {
      setToast({ type: 'error', text: 'No hay tema asociado a esta evaluación.' });
      return;
    }

    // Filtrar preguntas por theme_id
    const pool = questionBank.filter((q) => q.topic === currentThemeId);

    if (pool.length === 0) {
      setToast({ type: 'error', text: 'No hay preguntas disponibles para este tema.' });
      return;
    }

    const q = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(q);
    setToast({ type: 'info', text: 'Pregunta generada.' });
    setTimeout(() => setToast(null), 2500);
  };

  const updateCriteriaScore = (index: number, value: string) => {
    // Si está vacío, permitir
    if (value === '') {
      setCriteria((prev) =>
        prev.map((c, i) =>
          i === index ? { ...c, score: null } : c
        )
      );
      setSaved(false);
      return;
    }

    // Convertir coma a punto para procesamiento
    const strValue = String(value).replace(',', '.');
    
    // Validar formato: solo números con máximo 1 decimal
    const decimalRegex = /^\d+(\.\d{0,1})?$/;
    if (!decimalRegex.test(strValue)) {
      return; // No actualizar si el formato no es válido
    }

    const numValue = parseFloat(strValue);
    if (isNaN(numValue)) return;

    // Limitar al rango válido
    const finalValue = Math.max(0, Math.min(criteria[index].scor_max, numValue));
    
    // Redondear a 1 decimal
    const roundedValue = Math.round(finalValue * 10) / 10;

    setCriteria((prev) =>
      prev.map((c, i) =>
        i === index ? { ...c, score: roundedValue } : c
      )
    );
    setSaved(false);
  };

  // Validar que el texto contenga al menos una letra
  const isValidFeedback = (text: string): boolean => {
    // Si está vacío, es válido (campo opcional)
    if (text.trim() === '') return true;
    // Debe contener al menos una letra (no solo números y/o caracteres especiales)
    const hasLetter = /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(text);
    return hasLetter;
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Limitar a 500 caracteres
    if (value.length <= FEEDBACK_MAX_CHARS) {
      setFeedback(value);
      setFeedbackCharCount(value.length);
      setSaved(false);
    }
  };

  // Validar feedback antes de guardar
  const validateFeedbackBeforeSave = (): boolean => {
    if (!isValidFeedback(feedback)) {
      setToast({ type: 'error', text: 'Las observaciones deben contener texto válido (no solo números o caracteres especiales).' });
      setTimeout(() => setToast(null), 3000);
      return false;
    }
    return true;
  };

  const guardarProgreso = async () => {
    if (!evaluacionSeleccionada) return;
    
    // Validar feedback antes de guardar
    if (!validateFeedbackBeforeSave()) return;

    try {
      setSaving(true);
      const totalScore = criteria.reduce((sum, c) => sum + (c.score || 0), 0);
      const calculatedGrade = calculateFinalGrade(totalScore, maxTotal);

      // Preparar los scores para enviar
      const scores = criteria
        .filter(c => c.score !== null)
        .map(c => ({
          criterion_id: c.criterion_id,
          actual_score: c.score as number
        }));

      await updateEvaluation(evaluacionSeleccionada.evaluation_detail_id, {
        grade: parseFloat(calculatedGrade.toFixed(2)),
        observation: feedback || undefined,
        question_asked: currentQuestion?.text || undefined,
        scores: scores.length > 0 ? scores : undefined
      });

      setSaved(true);
      setToast({ type: 'success', text: 'Progreso guardado.' });
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setToast({ type: 'error', text: 'Error al guardar progreso' });
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const finalizeEvaluacion = async () => {
    // Validar que exista una pregunta generada
    if (!currentQuestion) {
      setToast({ type: 'error', text: 'Debe generar una pregunta antes de finalizar.' });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const incomplete = criteria.some((c) => c.score === null);
    if (incomplete) {
      setToast({ type: 'error', text: 'Complete todos los criterios antes de finalizar.' });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    // Validar feedback antes de finalizar
    if (!validateFeedbackBeforeSave()) return;

    if (!evaluacionSeleccionada) return;

    try {
      setSaving(true);
      const totalScore = criteria.reduce((sum, c) => sum + (c.score || 0), 0);
      const calculatedGrade = calculateFinalGrade(totalScore, maxTotal);

      await completeEvaluation(evaluacionSeleccionada.evaluation_detail_id);

      setCompleted(true);
      setToast({ type: 'success', text: `Evaluación completada. Nota final: ${calculatedGrade.toFixed(2)}` });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ type: 'error', text: 'Error al finalizar evaluación' });
      console.error('Error finalizing evaluation:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header variant="default" title="Facultad de Derecho" />

      <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Top Header Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#003366] mb-2">Realización de Evaluación</h1>
              <button
                onClick={() => navigate('/comisiones')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Cargando datos de la comisión...</p>
              </div>
            ) : commissionData ? (
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Comisión</p>
                  <p className="font-bold text-gray-900">{commissionData.commission_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Tema</p>
                  <p className="font-bold text-gray-900">{commissionData.theme?.theme_name || 'No asignado'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Total Estudiantes</p>
                  <p className="font-bold text-gray-900">{estudiantes.length}</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mt-4">
                No se pudo cargar la información de la comisión.
              </div>
            )}
          </div>

          {/* Selector de estudiantes */}
          {showStudentSelector && !loading && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-[#003366] mb-4">Seleccionar Estudiante a Evaluar</h2>
              
              {estudiantes.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 text-sm">
                  No hay estudiantes asignados a esta comisión.
                </div>
              ) : (
                <div className="space-y-3">
                  {estudiantes.map((estudiante) => {
                    const isCompleted = estudiante.evaluation_status === 'completed';
                    return (
                      <div
                        key={estudiante.user_id}
                        onClick={() => !isCompleted && loadStudentEvaluation(estudiante.user_id)}
                        className={`p-4 rounded-lg border transition-all ${
                          isCompleted 
                            ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
                            : 'bg-white border-gray-200 hover:border-[#003366] hover:shadow-md cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                              {isCompleted ? (
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{estudiante.user_name}</p>
                              <p className="text-sm text-gray-500">{estudiante.rut}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              isCompleted 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {isCompleted ? 'Evaluado' : 'Pendiente'}
                            </span>
                            {!isCompleted && (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Resumen de progreso */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progreso de evaluaciones:</span>
                  <span className="font-bold text-[#003366]">
                    {estudiantes.filter(e => e.evaluation_status === 'completed').length} / {estudiantes.length} completadas
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${estudiantes.length > 0 
                        ? (estudiantes.filter(e => e.evaluation_status === 'completed').length / estudiantes.length) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Loading estudiante */}
          {loadingStudents && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 text-center py-12">
              <p className="text-gray-500">Cargando evaluación del estudiante...</p>
            </div>
          )}

          {/* Contenido de evaluación (mostrar solo cuando hay estudiante seleccionado) */}
          {!showStudentSelector && !loadingStudents && evaluacionSeleccionada && (
            <>
              {/* Info del estudiante seleccionado */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-blue-900">Evaluando a: {evaluacionSeleccionada.user?.user_name}</p>
                      <p className="text-sm text-blue-700">ID Evaluación: #{evaluacionSeleccionada.evaluation_detail_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStudentSelector(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Cambiar estudiante
                  </button>
                </div>
              </div>
            </>
          )}

          {!showStudentSelector && !loadingStudents && evaluacionSeleccionada && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left Column */}
              <div className="flex flex-col gap-6">

                {/* Datos y Pregunta */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h2 className="text-lg font-bold text-[#003366] mb-4">Datos de la evaluación</h2>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">ID Evaluación</p>
                      <p className="font-medium text-gray-900 mt-1">#{evaluacionSeleccionada.evaluation_detail_id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Estudiante</p>
                      <p className="font-medium text-gray-900 mt-1">{evaluacionSeleccionada.user?.user_name || `#${evaluacionSeleccionada.user_id}`}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-bold text-[#003366] mb-2">Pregunta asignada</h3>
                    {currentQuestion ? (
                      <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {currentQuestion.text}
                        </p>
                        <div className="flex justify-end">
                          <button
                            onClick={generateRandomQuestion}
                            className="text-xs text-gray-500 underline hover:text-indigo-600 transition-colors"
                          >
                            Cambiar pregunta
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-4">
                        Aún no se ha generado una pregunta. Presiona "Generar pregunta" para obtener una del banco.
                      </p>
                    )}

                    {!currentQuestion && (
                      <button
                        onClick={generateRandomQuestion}
                        className="inline-flex px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Generar pregunta
                      </button>
                    )}
                  </div>
                </div>

                {/* Notas de sesión */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[#003366] mb-2">Notas de sesión</h3>
                  <p className="text-sm text-gray-500 mb-4">Puedes tomar notas rápidas sobre el desempeño del alumno durante la exposición.</p>
                  <div className="relative flex-1 flex flex-col">
                    <textarea
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[300px] bg-gray-50 placeholder-gray-400 flex-1"
                      placeholder="Escribe tus observaciones relevantes aquí..."
                      value={feedback}
                      onChange={handleFeedbackChange}
                      disabled={completed}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded">
                      {feedbackCharCount}/{FEEDBACK_MAX_CHARS}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">

                {/* Status de Pauta */}
                {!pautaExiste && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-700 text-sm">
                    <p className="font-semibold">⚠️ No hay pauta de evaluación</p>
                    <p className="mt-1">No existe una pauta asociada a esta evaluación. Crea una en la sección de Comisiones para poder calificar.</p>
                  </div>
                )}

                {/* Pauta de Evaluación */}
                {pautaExiste && (
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-[#003366]">Pauta de Evaluación</h3>
                        <p className="text-xs text-gray-500 mt-1">{evaluacionSeleccionada.guidline?.name}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${notaCalculada >= 4 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        Nota: {notaCalculada.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {criteria.map((c, i) => (
                        <div key={c.criterion_id} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{c.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              inputMode="decimal"
                              pattern="[0-9]*[.,]?[0-9]?"
                              value={c.score === null ? '' : c.score}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                // Permitir vacío, dígitos, punto o coma
                                if (inputValue === '' || /^[0-9]*[.,]?[0-9]?$/.test(inputValue)) {
                                  updateCriteriaScore(i, inputValue);
                                }
                              }}
                              placeholder="0"
                              disabled={completed}
                              className="w-16 border border-gray-300 rounded-md py-2 px-2 text-center text-sm font-medium focus:ring-2 focus:ring-[#003366] focus:border-[#003366] focus:outline-none disabled:bg-gray-100"
                            />
                            <span className="text-sm text-gray-500 font-medium">/ {c.scor_max}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-100">
                      <button
                        onClick={guardarProgreso}
                        disabled={saving || completed}
                        className="px-4 py-2 bg-white border border-[#003366] text-[#003366] font-bold rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Guardar progreso
                      </button>
                      <button
                        onClick={finalizeEvaluacion}
                        disabled={saving || completed}
                        className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Finalizar evaluación
                      </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3">
                      Puedes guardar la pauta ahora y completar la retroalimentación más tarde.
                    </p>
                  </div>
                )}

                {/* Retroalimentación */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-[#003366] mb-4">Retroalimentación</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Nota final (automática desde la pauta)</label>
                      <div className={`w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 font-bold text-lg ${notaCalculada >= 4 ? 'text-green-600' : 'text-red-600'}`}>
                        {pautaExiste ? `${notaCalculada.toFixed(2)}` : 'N/A'}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Puntaje: {partialTotal} / {maxTotal} ({maxTotal > 0 ? ((partialTotal / maxTotal) * 100).toFixed(1) : 0}%)
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Observaciones para el estudiante</label>
                      <div className="relative">
                        <textarea
                          placeholder="Escribe los comentarios y recomendaciones..."
                          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                          value={feedback}
                          onChange={handleFeedbackChange}
                          disabled={completed}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded border border-gray-200">
                          {feedbackCharCount}/{FEEDBACK_MAX_CHARS}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          if (!completed) {
                            setToast({ type: 'error', text: 'Finalice la evaluación antes de registrar la retroalimentación.' });
                            setTimeout(() => setToast(null), 2500);
                            return;
                          }
                          setToast({ type: 'success', text: 'Retroalimentación registrada. Seleccione otro estudiante.' });
                          setTimeout(() => setToast(null), 2500);
                          // Volver al selector de estudiantes
                          await handleBackToStudentSelector();
                        }}
                        disabled={!completed}
                        className="flex-1 px-4 py-2 bg-[#E67E22] text-white font-bold rounded-lg hover:bg-[#D35400] transition shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Registrar evaluación
                      </button>
                      <button
                        onClick={() => completed ? handleBackToStudentSelector() : setShowExitModal(true)}
                        className="px-4 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition shadow-sm flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de confirmación de salida */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">¿Está seguro que desea salir?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tiene cambios sin guardar. ¿Desea guardar el progreso antes de salir?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  await guardarProgreso();
                  setShowExitModal(false);
                  navigate('/comisiones');
                }}
                className="flex-1 px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#002244] transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar y salir
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  navigate('/comisiones');
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Salir sin guardar
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed right-6 bottom-6 max-w-xs p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#003366] text-white'}`}>
          <div className="flex-shrink-0">
            {toast.type === 'success' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            {toast.type === 'error' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
            {toast.type === 'info' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          </div>
          <p className="text-sm font-medium">{toast.text}</p>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
