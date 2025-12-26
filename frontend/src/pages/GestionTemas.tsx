import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

// Interfaces
interface Pregunta {
    id: number;
    texto: string;
    respuestaEsperada: string;
    fechaCreacion: string;
}

interface Tema {
    id: number;
    nombre: string;
    asignatura: string;
    preguntas: Pregunta[];
    guardado: boolean;
}

interface Asignatura {
    id: number;
    nombre: string;
    codigo: string;
}

// Mock Data
const MOCK_ASIGNATURAS: Asignatura[] = [
    { id: 1, nombre: 'Derecho Civil I', codigo: 'DER-101' },
    { id: 2, nombre: 'Derecho Penal', codigo: 'DER-201' },
    { id: 3, nombre: 'Derecho Procesal', codigo: 'DER-301' },
    { id: 4, nombre: 'Derecho Constitucional', codigo: 'DER-401' },
];

const MOCK_TEMAS_EXISTENTES: Tema[] = [
    {
        id: 1,
        nombre: 'Cédula I - Bienes',
        asignatura: 'Derecho Civil I',
        guardado: true,
        preguntas: [
            { id: 1, texto: '¿Qué es un bien inmueble por naturaleza?', respuestaEsperada: 'Son aquellos que no pueden trasladarse de un lugar a otro sin alterar su naturaleza.', fechaCreacion: '2025-12-20' },
            { id: 2, texto: '¿Cuál es la diferencia entre bienes muebles e inmuebles?', respuestaEsperada: 'Los bienes muebles pueden trasladarse, los inmuebles no.', fechaCreacion: '2025-12-20' },
        ]
    },
    {
        id: 2,
        nombre: 'Teoría del Delito',
        asignatura: 'Derecho Penal',
        guardado: true,
        preguntas: [
            { id: 1, texto: '¿Qué es el dolo?', respuestaEsperada: 'Es la voluntad deliberada de cometer un acto a sabiendas de su ilicitud.', fechaCreacion: '2025-12-18' },
        ]
    },
];

export default function GestionTemas() {
    // Estado para la asignatura seleccionada
    const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState<Asignatura | null>(null);

    // Estado del tema actual
    const [temaActual, setTemaActual] = useState<Tema>({
        id: 0,
        nombre: '',
        asignatura: '',
        preguntas: [],
        guardado: false,
    });

    // Estado para temas existentes
    const [temasExistentes, setTemasExistentes] = useState<Tema[]>(MOCK_TEMAS_EXISTENTES);

    // Estado para nueva pregunta
    const [nuevaPregunta, setNuevaPregunta] = useState({
        texto: '',
        respuestaEsperada: '',
    });

    // Estado para edición de pregunta
    const [editandoPregunta, setEditandoPregunta] = useState<number | null>(null);
    const [preguntaEditada, setPreguntaEditada] = useState({
        texto: '',
        respuestaEsperada: '',
    });

    // Estado para ver tema existente
    const [temaSeleccionado, setTemaSeleccionado] = useState<Tema | null>(null);

    const handleAsignaturaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const asignaturaId = parseInt(e.target.value);
        const asignatura = MOCK_ASIGNATURAS.find(a => a.id === asignaturaId) || null;
        setAsignaturaSeleccionada(asignatura);
        setTemaActual({
            ...temaActual,
            asignatura: asignatura?.nombre || '',
        });
        setTemaSeleccionado(null);
    };

    const handleGuardarTema = () => {
        if (!temaActual.nombre.trim()) return;

        const nuevoTema: Tema = {
            ...temaActual,
            id: temasExistentes.length + 1,
            guardado: true,
        };

        setTemaActual(nuevoTema);
        setTemasExistentes([...temasExistentes, nuevoTema]);
    };

    const handleAgregarPregunta = () => {
        if (!nuevaPregunta.texto.trim() || !nuevaPregunta.respuestaEsperada.trim()) return;

        const pregunta: Pregunta = {
            id: temaActual.preguntas.length + 1,
            texto: nuevaPregunta.texto,
            respuestaEsperada: nuevaPregunta.respuestaEsperada,
            fechaCreacion: new Date().toISOString().split('T')[0],
        };

        const temaActualizado = {
            ...temaActual,
            preguntas: [...temaActual.preguntas, pregunta],
        };

        setTemaActual(temaActualizado);

        // Actualizar en la lista de temas existentes si ya está guardado
        if (temaActual.guardado) {
            setTemasExistentes(temasExistentes.map(t =>
                t.id === temaActual.id ? temaActualizado : t
            ));
        }

        setNuevaPregunta({ texto: '', respuestaEsperada: '' });
    };

    const handleEliminarPregunta = (preguntaId: number) => {
        const temaActualizado = {
            ...temaActual,
            preguntas: temaActual.preguntas.filter(p => p.id !== preguntaId),
        };

        setTemaActual(temaActualizado);

        if (temaActual.guardado) {
            setTemasExistentes(temasExistentes.map(t =>
                t.id === temaActual.id ? temaActualizado : t
            ));
        }
    };

    const handleIniciarEdicion = (pregunta: Pregunta) => {
        setEditandoPregunta(pregunta.id);
        setPreguntaEditada({
            texto: pregunta.texto,
            respuestaEsperada: pregunta.respuestaEsperada,
        });
    };

    const handleGuardarEdicion = (preguntaId: number) => {
        const temaActualizado = {
            ...temaActual,
            preguntas: temaActual.preguntas.map(p =>
                p.id === preguntaId
                    ? { ...p, texto: preguntaEditada.texto, respuestaEsperada: preguntaEditada.respuestaEsperada }
                    : p
            ),
        };

        setTemaActual(temaActualizado);

        if (temaActual.guardado) {
            setTemasExistentes(temasExistentes.map(t =>
                t.id === temaActual.id ? temaActualizado : t
            ));
        }

        setEditandoPregunta(null);
        setPreguntaEditada({ texto: '', respuestaEsperada: '' });
    };

    const handleCancelarEdicion = () => {
        setEditandoPregunta(null);
        setPreguntaEditada({ texto: '', respuestaEsperada: '' });
    };

    const handleSeleccionarTema = (tema: Tema) => {
        setTemaSeleccionado(tema);
        setTemaActual(tema);
    };

    const handleNuevoTema = () => {
        setTemaSeleccionado(null);
        setTemaActual({
            id: 0,
            nombre: '',
            asignatura: asignaturaSeleccionada?.nombre || '',
            preguntas: [],
            guardado: false,
        });
    };

    const temasDeAsignatura = temasExistentes.filter(
        t => t.asignatura === asignaturaSeleccionada?.nombre
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />

            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003366] min-h-[112px] flex flex-col justify-center">
                        <h1 className="text-2xl font-bold text-[#003366]">Gestión de Temas y Banco de Preguntas</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Cree temas de evaluación y agregue preguntas al banco para cada asignatura.
                        </p>
                    </div>

                    {/* Selector de Asignatura */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#003366] rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-[#003366]">Seleccionar Asignatura</h2>
                        </div>

                        <div className="relative">
                            <select
                                value={asignaturaSeleccionada?.id || ''}
                                onChange={handleAsignaturaChange}
                                className="block w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                            >
                                <option value="" disabled>Seleccione una asignatura...</option>
                                {MOCK_ASIGNATURAS.map(asignatura => (
                                    <option key={asignatura.id} value={asignatura.id}>
                                        {asignatura.codigo} - {asignatura.nombre}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal (solo si hay asignatura seleccionada) */}
                    {asignaturaSeleccionada && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Sidebar - Temas Existentes */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-800">Temas de {asignaturaSeleccionada.nombre}</h3>
                                            <button
                                                onClick={handleNuevoTema}
                                                className="p-1.5 text-[#003366] hover:bg-blue-50 rounded-lg transition"
                                                title="Nuevo Tema"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                        {temasDeAsignatura.length === 0 ? (
                                            <div className="p-6 text-center text-gray-500">
                                                <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-sm">No hay temas creados</p>
                                            </div>
                                        ) : (
                                            temasDeAsignatura.map((tema) => (
                                                <button
                                                    key={tema.id}
                                                    onClick={() => handleSeleccionarTema(tema)}
                                                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${temaSeleccionado?.id === tema.id ? 'bg-blue-50 border-l-4 border-[#003366]' : ''}`}
                                                >
                                                    <h4 className="font-semibold text-gray-800 text-sm">{tema.nombre}</h4>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                            {tema.preguntas.length} preguntas
                                                        </span>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Panel Principal */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Panel de Creación/Edición de Tema */}
                                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-[#003366] rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-lg font-bold text-[#003366]">
                                            {temaActual.guardado ? 'Editar Tema' : 'Crear Nuevo Tema'}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                Nombre del Tema <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={temaActual.nombre}
                                                onChange={(e) => setTemaActual({ ...temaActual, nombre: e.target.value })}
                                                className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                                placeholder="Ej: Cédula I - Bienes"
                                            />
                                        </div>

                                        <button
                                            onClick={handleGuardarTema}
                                            disabled={!temaActual.nombre.trim()}
                                            className="inline-flex items-center px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Guardar Definición del Tema
                                        </button>
                                    </div>
                                </div>

                                {/* Módulo Banco de Preguntas (solo si el tema está guardado) */}
                                {temaActual.guardado && (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-green-600 rounded-lg">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-[#003366]">Banco de Preguntas</h2>
                                                    <p className="text-sm text-gray-500">Tema: {temaActual.nombre}</p>
                                                </div>
                                            </div>

                                            {/* Formulario de Ingreso Rápido */}
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                        Texto de la Pregunta <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={nuevaPregunta.texto}
                                                        onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, texto: e.target.value })}
                                                        className="block w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                                        placeholder="Escriba la pregunta..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                        Respuesta Esperada / Pauta de Corrección <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        value={nuevaPregunta.respuestaEsperada}
                                                        onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuestaEsperada: e.target.value })}
                                                        className="block w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition min-h-[80px] resize-y"
                                                        placeholder="Puntos clave de la respuesta esperada..."
                                                    />
                                                </div>

                                                <button
                                                    onClick={handleAgregarPregunta}
                                                    disabled={!nuevaPregunta.texto.trim() || !nuevaPregunta.respuestaEsperada.trim()}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Agregar Pregunta
                                                </button>
                                            </div>
                                        </div>

                                        {/* Listado de Preguntas */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-gray-800">Preguntas Agregadas</h3>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                                                    Total: {temaActual.preguntas.length} preguntas
                                                </span>
                                            </div>

                                            {temaActual.preguntas.length === 0 ? (
                                                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-gray-500 font-medium">No hay preguntas agregadas</p>
                                                    <p className="text-sm text-gray-400 mt-1">Use el formulario de arriba para agregar preguntas</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {temaActual.preguntas.map((pregunta, index) => (
                                                        <div
                                                            key={pregunta.id}
                                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition bg-white"
                                                        >
                                                            {editandoPregunta === pregunta.id ? (
                                                                // Modo Edición
                                                                <div className="space-y-3">
                                                                    <input
                                                                        type="text"
                                                                        value={preguntaEditada.texto}
                                                                        onChange={(e) => setPreguntaEditada({ ...preguntaEditada, texto: e.target.value })}
                                                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                                                    />
                                                                    <textarea
                                                                        value={preguntaEditada.respuestaEsperada}
                                                                        onChange={(e) => setPreguntaEditada({ ...preguntaEditada, respuestaEsperada: e.target.value })}
                                                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition min-h-[60px] resize-y"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleGuardarEdicion(pregunta.id)}
                                                                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium"
                                                                        >
                                                                            Guardar
                                                                        </button>
                                                                        <button
                                                                            onClick={handleCancelarEdicion}
                                                                            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs font-medium"
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // Modo Vista
                                                                <>
                                                                    <div className="flex items-start justify-between gap-4">
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#003366] text-white text-xs font-bold">
                                                                                    {index + 1}
                                                                                </span>
                                                                                <h4 className="font-semibold text-gray-800 text-sm">{pregunta.texto}</h4>
                                                                            </div>
                                                                            <div className="ml-8">
                                                                                <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded border-l-2 border-green-500">
                                                                                    {pregunta.respuestaEsperada}
                                                                                </p>
                                                                                <p className="text-xs text-gray-400 mt-2">
                                                                                    Agregada: {pregunta.fechaCreacion}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            <button
                                                                                onClick={() => handleIniciarEdicion(pregunta)}
                                                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                                                title="Editar"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleEliminarPregunta(pregunta.id)}
                                                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                                                title="Eliminar"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </main>

            <BottomNavigation />
        </div>
    );
}
