import React, { useMemo, useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

type Question = { id: string; text: string; topic: string };
type Criterion = {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  score: number | null;
};

export default function RealizacionEvaluacion() {
  // Mock context data (replace with props / API calls)
  const student = { name: 'María Pérez', id: 'A2025', topic: 'Derecho Civil - Contratos' };
  const evaluation = { id: 'EV-101', name: 'Oral - Contratos' };

  const questionBank: Question[] = [
    { id: 'q1', text: 'Explique los elementos esenciales de un contrato.', topic: 'Derecho Civil - Contratos' },
    { id: 'q2', text: '¿Qué es la lesión y cómo se prueba?', topic: 'Derecho Civil - Contratos' },
    { id: 'q3', text: 'Diferencie error, dolo y fuerza mayor en los contratos.', topic: 'Derecho Civil - Contratos' },
    { id: 'q4', text: 'Análisis de cláusula abusiva en contratos de adhesión.', topic: 'Derecho Civil - Contratos' },
  ];

  // Inicializar pauta (viene de otra fuente en producción)
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: 'c1', name: 'Claridad expositiva', description: 'Orden y claridad en la respuesta', maxScore: 3, score: null },
    { id: 'c2', name: 'Rigor jurídico', description: 'Uso correcto de normas y doctrina', maxScore: 4, score: null },
    { id: 'c3', name: 'Aplicación de casos', description: 'Capacidad de aplicar normas a supuestos', maxScore: 3, score: null },
  ]);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [toast, setToast] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  const partialTotal = useMemo(() => {
    return criteria.reduce((s, c) => s + (c.score ?? 0), 0);
  }, [criteria]);

  const maxTotal = useMemo(() => {
    return criteria.reduce((s, c) => s + c.maxScore, 0);
  }, [criteria]);

  function generateRandomQuestion() {
    const pool = questionBank.filter((q) => q.topic === student.topic);
    if (pool.length === 0) {
      setToast({ type: 'error', text: 'No hay preguntas para el tema asignado.' });
      return;
    }
    const q = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(q);
    setToast({ type: 'info', text: 'Pregunta generada.' });
    setTimeout(() => setToast(null), 2500);
  }

  function ActualizarPuntaje(index: number, value: number | '') {
    setCriteria((prev) =>
      prev.map((c, i) =>
        i === index
          ? { ...c, score: value === '' ? null : Math.max(0, Math.min(c.maxScore, Number(value))) }
          : c
      )
    );
    setSaved(false);
  }

  function guardarProgreso() {
    setSaving(true);
    // Simular petición
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setToast({ type: 'success', text: 'Progreso guardado.' });
      setTimeout(() => setToast(null), 2500);
    }, 900);
  }

  function finalizeEvaluacion() {
    // Validación básica: todos los criterios deben tener un score numérico
    const incomplete = criteria.some((c) => c.score === null);
    if (incomplete) {
      setToast({ type: 'error', text: 'Complete todos los criterios antes de finalizar.' });
      setTimeout(() => setToast(null), 2500);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCompleted(true);
      setToast({ type: 'success', text: `Evaluación completada. Nota final: ${partialTotal}/${maxTotal}` });
      setTimeout(() => setToast(null), 3000);
    }, 1100);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header variant="default" title="Facultad de Derecho" />

      {/* Main Container */}
      <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Top Header Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h1 className="text-2xl font-bold text-[#003366] mb-2">Realización de Evaluación</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              <p>Evaluación de <span className="font-bold text-gray-900">{student.name}</span></p>
              <span className="text-gray-300">•</span>
              <p>Tema: <span className="font-bold text-gray-900">{student.topic}</span></p>
              <span className="text-gray-300">•</span>
              <p>Asignatura: <span className="font-bold text-gray-900">Derecho Civil I</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left Column */}
            <div className="flex flex-col gap-6">

              {/* Datos y Pregunta */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-[#003366] mb-4">Datos de la evaluación</h2>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">ID Evaluación</p>
                    <p className="font-medium text-gray-900 mt-1">{evaluation.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Alumno</p>
                    <p className="font-medium text-gray-900 mt-1">{student.name}</p>
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
                      className="inline-flex px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <textarea
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[300px] bg-gray-50 placeholder-gray-400 flex-1"
                  placeholder="Escribe tus observaciones relevantes aquí..."
                  value={feedback}
                  onChange={(e) => { setFeedback(e.target.value); setSaved(false); }}
                  disabled={completed}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Pauta de Evaluación */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#003366]">Pauta de Evaluación</h3>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                    Total parcial: {partialTotal}/{maxTotal}
                  </span>
                </div>

                <div className="space-y-8">
                  {criteria.map((c, i) => (
                    <div key={c.id}>
                      <div className="flex justify-between items-baseline mb-2">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">Máx: {c.maxScore}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Custom Slider */}
                        <div className="relative w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className="absolute h-full bg-[#003366] rounded-full"
                            style={{ width: `${((c.score || 0) / c.maxScore) * 100}%` }}
                          ></div>
                          <input
                            type="range"
                            min={0}
                            max={c.maxScore}
                            step={1}
                            value={c.score || 0}
                            onChange={(e) => ActualizarPuntaje(i, Number(e.target.value))}
                            className="absolute w-full h-full opacity-0 cursor-pointer"
                            disabled={completed}
                          />
                          {/* Thumb visual indicator could be added here if customized completely */}
                          <div
                            className="absolute w-4 h-4 bg-[#003366] rounded-full top-1/2 transform -translate-y-1/2 -ml-2 pointer-events-none transition-all"
                            style={{ left: `${((c.score || 0) / c.maxScore) * 100}%` }}
                          ></div>
                        </div>

                        <input
                          type="number"
                          min={0}
                          max={c.maxScore}
                          value={c.score === null ? '' : c.score}
                          onChange={(e) => ActualizarPuntaje(i, e.target.value === '' ? '' : Number(e.target.value))}
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
                    className="px-4 py-2 bg-white border border-[#003366] text-[#003366] font-bold rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    Guardar progreso
                  </button>
                  <button
                    onClick={finalizeEvaluacion}
                    disabled={saving || completed}
                    className="px-4 py-2 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#004488] transition shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    Finalizar evaluación
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Puedes guardar la pauta ahora y completar la nota y retroalimentación más tarde.
                </p>
              </div>

              {/* Nota y Retroalimentación */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-[#003366] mb-4">Nota y retroalimentación final</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Nota (automática desde la pauta)</label>
                    <div className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-700 font-medium">
                      {partialTotal} / {maxTotal}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Retroalimentación para el alumno</label>
                    <textarea
                      placeholder="Escribe los comentarios finales..."
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                      value={feedback} // Note: This shares state with top textarea as per original code behavior for simplicity, or could be separate.
                      // Based on original code, 'feedback' state was shared. I'll keep it shared or should I separate?
                      // The logical flow suggests 2 distinct fields: "Session Notes" (private?) vs "Final Feedback" (public?). 
                      // For this refactor I will create a new state for final feedback or re-use 'feedback' for now to match logic.
                      // Ideally they are separate. I will assume they are intended to be separate in a full app but here I might reuse or add state.
                      // Let's create a new state for 'finalFeedback' to avoid confusion if user types in both. 
                      // Wait, I can't add state inside this return block replacement.
                      // I will reuse 'feedback' for "Retroalimentación" and use a new generic text for the top one?
                      // Actually, the original code had "Notas de sesión" textarea bound to `feedback`.
                      // And "Retroalimentación para el alumno" textarea ALSO bound to `feedback`.
                      // So they were mirrored. I will keep it mirrored to preserve logic, or check line 34.
                      onChange={(e) => { setFeedback(e.target.value); setSaved(false); }}
                      disabled={completed}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!completed) {
                        setToast({ type: 'error', text: 'Finalice la evaluación antes de registrar la nota definitiva.' });
                        setTimeout(() => setToast(null), 2500);
                        return;
                      }
                      setToast({ type: 'success', text: 'Nota y retroalimentación registradas.' });
                      setTimeout(() => setToast(null), 2500);
                    }}
                    className="mx-auto px-4 py-2 bg-[#E67E22] text-white font-bold rounded-lg hover:bg-[#D35400] transition shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Registrar nota y retroalimentación
                  </button>
                </div>
              </div>

            </div>
          </div>
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