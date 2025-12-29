import React from 'react';

interface Estudiante {
    id: number;
    nombre: string;
    rut: string;
    role?: string;
}

interface Comision {
    id: number;
    nombre?: string;
    fecha: string;
    hora: string;
    modalidad: 'presencial' | 'online';
    lugar: string;
    estudiantes: Estudiante[];
    evaluada?: boolean;
}

interface ComisionCardProps {
    comision: Comision;
    index: number;
    isAdmin: boolean;
    evaluacionEstado: 'pendiente' | 'finalizada';
    temaId: number;
    formatDate: (date: string) => string;
    onRealizarEvaluacion: (comision: Comision) => void;
    onEditar: (comision: Comision) => void;
    onEliminar: (comisionId: number) => void;
    onToggleResultados?: (comisionId: number) => void;
    showResultados?: boolean;
    loadingResultados?: boolean;
    resultados?: any[];
}

const ComisionCard: React.FC<ComisionCardProps> = ({
    comision,
    index,
    isAdmin,
    evaluacionEstado,
    formatDate,
    onRealizarEvaluacion,
    onEditar,
    onEliminar,
    onToggleResultados,
    showResultados,
    loadingResultados,
    resultados,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            comision.modalidad === 'presencial' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                        }`}>
                            {comision.modalidad === 'presencial' ? '📍 Presencial' : '💻 Online'}
                        </span>
                        <span className="text-sm text-gray-500">Comisión {index + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium capitalize">{formatDate(comision.fecha)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">{comision.hora} hrs</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700 mb-4">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{comision.lugar}</span>
                    </div>

                    {/* Lista de estudiantes */}
                    <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Estudiantes ({comision.estudiantes.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {comision.estudiantes.map((estudiante) => (
                                <span
                                    key={estudiante.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                                >
                                    {estudiante.nombre}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-2 min-w-40">
                    {!comision.evaluada ? (
                        <>
                            {!isAdmin && (
                                <button
                                    onClick={() => onRealizarEvaluacion(comision)}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Realizar Evaluación
                                </button>
                            )}
                            {(!isAdmin || evaluacionEstado === 'pendiente') && (
                                <>
                                    <button
                                        onClick={() => onEditar(comision)}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onEliminar(comision.id)}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Eliminar
                                    </button>
                                </>
                            )}
                        </>
                    ) : onToggleResultados && (
                        <button
                            onClick={() => onToggleResultados(comision.id)}
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                            <svg className={`w-4 h-4 mr-2 transition-transform ${showResultados ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {showResultados ? 'Ocultar Resultados' : 'Ver Resultados'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComisionCard;
