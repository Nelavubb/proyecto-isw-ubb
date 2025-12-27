import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { getEvaluationsPending, updateEvaluation, completeEvaluation, EvaluationDetail } from '../services/evaluationService';
import { getAllQuestions } from '../services/questionService';
import { getGuidelinesByTheme } from '../services/guidelineService';

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
};

export default function RealizacionEvaluacion() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Obtener parámetros de la URL
  const evaluationDetailId = searchParams.get('evaluation_detail_id');
  const themeId = searchParams.get('theme_id');

  // Estados principales
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<EvaluacionPendiente | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGuideline, setLoadingGuideline] = useState(false);

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

  const FEEDBACK_MAX_CHARS = 500;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [evaluationDetailId, themeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (!evaluationDetailId || !themeId) {
        setToast({ type: 'error', text: 'Parámetros inválidos. Por favor, vuelve a Comisiones.' });
        setTimeout(() => navigate('/comisiones'), 2000);
        return;
      }

      // Cargar la evaluación específica
      const evaluaciones = await getEvaluationsPending();
      const evalBase = evaluaciones.find(e => e.evaluation_detail_id === parseInt(evaluationDetailId));
      
      if (!evalBase) {
        setToast({ type: 'error', text: 'Evaluación no encontrada.' });
        setTimeout(() => navigate('/comisiones'), 2000);
        return;
      }

      // Castear a tipo completo
      const evaluation = evalBase as EvaluacionPendiente;

      // Cargar pauta para el tema
      try {
        setLoadingGuideline(true);
        const guidelines = await getGuidelinesByTheme(parseInt(themeId));
        if (guidelines && guidelines.length > 0) {
          const guideline = guidelines[0];
          // Enriquecer la evaluación con los criterios de la pauta
          evaluation.criteria = guideline.description || [];
          evaluation.guidline = {
            guidline_id: guideline.guidline_id || 0,
            name: guideline.name,
            theme: {
              theme_id: guideline.theme_id,
              theme_name: ''
            }
          };
        }
      } catch (error) {
        console.warn('No se pudo cargar la pauta:', error);
      } finally {
        setLoadingGuideline(false);
      }

      setEvaluacionSeleccionada(evaluation);

      // Cargar criterios de la pauta
      if (evaluation.criteria && Array.isArray(evaluation.criteria) && evaluation.criteria.length > 0) {
        const loadedCriteria = evaluation.criteria.map((crit: any) => ({
          criterion_id: crit.criterion_id,
          description: crit.description,
          scor_max: crit.scor_max || 5,
          score: evaluation.grade ? null : null,
        }));
        setCriteria(loadedCriteria);
      } else {
        setCriteria([]);
      }

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
      setToast({ type: 'error', text: 'Error al cargar la evaluación' });
    } finally {
      setLoading(false);
    }
  };

  const partialTotal = useMemo(() => {
    return criteria.reduce((sum, c) => sum + (c.score ?? 0), 0);
  }, [criteria]);

  const maxTotal = useMemo(() => {
    return criteria.reduce((sum, c) => sum + c.scor_max, 0);
  }, [criteria]);

  const pautaExiste = evaluacionSeleccionada && evaluacionSeleccionada.criteria && evaluacionSeleccionada.criteria.length > 0;

  const generateRandomQuestion = () => {
    if (!evaluacionSeleccionada?.guidline?.theme?.theme_name) {
      setToast({ type: 'error', text: 'No hay tema asociado a esta evaluación.' });
      return;
    }

    const themeName = evaluacionSeleccionada.guidline.theme.theme_name;
    const pool = questionBank.filter((q) => q.topic === themeName);

    if (pool.length === 0) {
      setToast({ type: 'error', text: 'No hay preguntas para el tema asignado.' });
      return;
    }

    const q = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(q);
    setToast({ type: 'info', text: 'Pregunta generada.' });
    setTimeout(() => setToast(null), 2500);
  };

  const updateCriteriaScore = (index: number, value: number | '') => {
    setCriteria((prev) =>
      prev.map((c, i) =>
        i === index
          ? { ...c, score: value === '' ? null : Math.max(0, Math.min(c.scor_max, Number(value))) }
          : c
      )
    );
    setSaved(false);
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

  const guardarProgreso = async () => {
    if (!evaluacionSeleccionada) return;

    try {
      setSaving(true);
      const totalGrade = criteria.reduce((sum, c) => sum + (c.score || 0), 0);

      await updateEvaluation(evaluacionSeleccionada.evaluation_detail_id, {
        grade: totalGrade,
        observation: feedback,
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
    const incomplete = criteria.some((c) => c.score === null);
    if (incomplete) {
      setToast({ type: 'error', text: 'Complete todos los criterios antes de finalizar.' });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    if (!evaluacionSeleccionada) return;

    try {
      setSaving(true);
      const totalGrade = criteria.reduce((sum, c) => sum + (c.score || 0), 0);

      await completeEvaluation(evaluacionSeleccionada.evaluation_detail_id);

      setCompleted(true);
      setToast({ type: 'success', text: `Evaluación completada. Nota final: ${totalGrade}/${maxTotal}` });
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
            <h1 className="text-2xl font-bold text-[#003366] mb-2">Realización de Evaluación</h1>

            {loading || loadingGuideline ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Cargando evaluación...</p>
              </div>
            ) : evaluacionSeleccionada ? (
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Comisión</p>
                  <p className="font-bold text-gray-900">{evaluacionSeleccionada.commission?.commission_name || `#${evaluacionSeleccionada.commission_id}`}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Tema</p>
                  <p className="font-bold text-gray-900">{evaluacionSeleccionada.guidline?.theme?.theme_name || 'No asignado'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Estudiante</p>
                  <p className="font-bold text-gray-900">{evaluacionSeleccionada.user?.user_name || `#${evaluacionSeleccionada.user_id}`}</p>
                </div>
                <button
                  onClick={() => navigate('/comisiones')}
                  className="ml-auto text-blue-600 hover:text-blue-800 underline text-xs font-semibold"
                >
                  Volver a Comisiones
                </button>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mt-4">
                No se pudo cargar la evaluación. Por favor, vuelve a Comisiones e intenta de nuevo.
              </div>
            )}
          </div>

          {evaluacionSeleccionada && (
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
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                        Nota: {partialTotal}/{maxTotal}
                      </span>
                    </div>

                    <div className="space-y-8">
                      {criteria.map((c, i) => (
                        <div key={c.criterion_id}>
                          <div className="flex justify-between items-baseline mb-2">
                            <div className="flex-1">
                              <p className="font-bold text-gray-800 text-sm">{c.description}</p>
                            </div>
                            <span className="text-xs text-gray-400 font-medium ml-2">Máx: {c.scor_max}</span>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Slider */}
                            <div className="relative w-full h-2 bg-gray-200 rounded-full">
                              <div
                                className="absolute h-full bg-[#003366] rounded-full"
                                style={{ width: `${((c.score || 0) / c.scor_max) * 100}%` }}
                              ></div>
                              <input
                                type="range"
                                min={0}
                                max={c.scor_max}
                                step={1}
                                value={c.score || 0}
                                onChange={(e) => updateCriteriaScore(i, Number(e.target.value))}
                                className="absolute w-full h-full opacity-0 cursor-pointer"
                                disabled={completed}
                              />
                              <div
                                className="absolute w-4 h-4 bg-[#003366] rounded-full top-1/2 transform -translate-y-1/2 -ml-2 pointer-events-none transition-all"
                                style={{ left: `${((c.score || 0) / c.scor_max) * 100}%` }}
                              ></div>
                            </div>

                            {/* Input de puntaje */}
                            <input
                              type="number"
                              min={0}
                              max={c.scor_max}
                              value={c.score === null ? '' : c.score}
                              onChange={(e) => updateCriteriaScore(i, e.target.value === '' ? '' : Number(e.target.value))}
                              disabled={completed}
                              className="w-16 border border-gray-200 rounded-md py-1 px-2 text-center text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
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
                      <div className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-700 font-bold text-lg">
                        {pautaExiste ? `${partialTotal} / ${maxTotal}` : 'N/A'}
                      </div>
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

                    <button
                      onClick={() => {
                        if (!completed) {
                          setToast({ type: 'error', text: 'Finalice la evaluación antes de registrar la retroalimentación.' });
                          setTimeout(() => setToast(null), 2500);
                          return;
                        }
                        setToast({ type: 'success', text: 'Retroalimentación registrada.' });
                        setTimeout(() => setToast(null), 2500);
                      }}
                      disabled={!completed}
                      className="w-full px-4 py-2 bg-[#E67E22] text-white font-bold rounded-lg hover:bg-[#D35400] transition shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Registrar retroalimentación
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>

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