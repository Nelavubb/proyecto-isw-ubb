import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { getGuidelines, Guideline } from '../services/guidelineService';
import { getAllThemes, Theme } from '../services/themeService';
import { getSubjectsByUser, Subject } from '../services/subjectService';
import { 
    getCommissions, 
    createCommission, 
    deleteCommission,
    getAllStudents,
    Commission as CommissionAPI,
    Estudiante as EstudianteAPI
} from '../services/commissionService';
import { useAuth } from '../hooks/useAuth';

// Interfaces para los datos
interface Tema {
    id: number;
    nombre: string;
    asignatura: string;
    subjectId?: number;
    nombrePauta?: string;
    pautaAsignada?: boolean;
}

interface Estudiante {
    id: number;
    nombre: string;
    rut: string;
    email?: string;
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

interface Evaluacion {
    id: number;
    tema: Tema;
    nombrePauta: string;
    comisiones: Comision[];
    estado: 'borrador' | 'programada' | 'en_curso' | 'finalizada';
    fechaCreacion: string;
    totalEstudiantes: number;
}

// Los datos ahora se cargan desde el backend

export default function Comisiones() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    
    // Leer parámetro step de la URL
    const step = searchParams.get('step');
    
    // Estado para controlar la vista actual: 'lista', 'crear' o 'detalle'
    const [vistaActual, setVistaActual] = useState<'lista' | 'crear' | 'detalle'>(step === 'crear' ? 'crear' : 'lista');
    
    // Estado para las evaluaciones (cargadas desde backend)
    const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
    const [loadingEvaluaciones, setLoadingEvaluaciones] = useState(true);
    
    // Estado para la evaluación seleccionada (vista detalle)
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<Evaluacion | null>(null);
    
    // Estado para las pautas
    const [pautas, setPautas] = useState<Guideline[]>([]);
    const [loadingPautas, setLoadingPautas] = useState(false);

    // Estado para temas y estudiantes (cargados desde backend)
    const [temas, setTemas] = useState<Tema[]>([]);
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [loadingTemas, setLoadingTemas] = useState(false);
    const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
    const [asignaturas, setAsignaturas] = useState<Subject[]>([]);

    // Estados para la creación de evaluación
    const [temaSeleccionado, setTemaSeleccionado] = useState<Tema | null>(null);
    const [pautaSeleccionada, setPautaSeleccionada] = useState<Guideline | null>(null);
    const [nombrePauta, setNombrePauta] = useState('');
    const [comisiones, setComisiones] = useState<Comision[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [searchEstudiante, setSearchEstudiante] = useState('');

    // Estado del formulario de nueva comisión
    const [nuevaComision, setNuevaComision] = useState({
        fecha: '',
        hora: '',
        modalidad: 'presencial' as 'presencial' | 'online',
        lugar: '',
        estudiantesSeleccionados: [] as number[],
    });

    // Cargar datos al montarse el componente
    useEffect(() => {
        loadPautas();
        loadTemas();
        loadEstudiantes();
        loadComisiones();
    }, []);

    const loadComisiones = async () => {
        try {
            setLoadingEvaluaciones(true);
            const userId = user?.id ? parseInt(user.id) : undefined;
            const data = await getCommissions(userId ? { userId } : undefined);
            
            // Agrupar comisiones por tema para crear "evaluaciones"
            const evaluacionesMap = new Map<number, Evaluacion>();
            
            for (const commission of data) {
                const themeId = commission.theme_id;
                
                if (!evaluacionesMap.has(themeId)) {
                    evaluacionesMap.set(themeId, {
                        id: themeId,
                        tema: {
                            id: themeId,
                            nombre: commission.theme?.theme_name || 'Tema sin nombre',
                            asignatura: '', // Se puede obtener del backend si es necesario
                        },
                        nombrePauta: 'Pauta asociada',
                        comisiones: [],
                        estado: 'programada',
                        fechaCreacion: commission.date,
                        totalEstudiantes: 0,
                    });
                }
                
                const evaluacion = evaluacionesMap.get(themeId)!;
                const estudiantes: Estudiante[] = commission.estudiantes?.map(e => ({
                    id: e.user_id,
                    nombre: e.user_name,
                    rut: e.rut,
                })) || [];
                
                evaluacion.comisiones.push({
                    id: commission.commission_id,
                    nombre: commission.commission_name,
                    fecha: commission.date,
                    hora: commission.time,
                    modalidad: commission.location?.includes('http') ? 'online' : 'presencial',
                    lugar: commission.location,
                    estudiantes: estudiantes,
                    evaluada: false,
                });
                
                evaluacion.totalEstudiantes += estudiantes.length;
            }
            
            setEvaluaciones(Array.from(evaluacionesMap.values()));
        } catch (error) {
            console.error('Error al cargar comisiones:', error);
        } finally {
            setLoadingEvaluaciones(false);
        }
    };

    const loadPautas = async () => {
        try {
            setLoadingPautas(true);
            const data = await getGuidelines();
            setPautas(data);
        } catch (error) {
            console.error('Error al cargar pautas:', error);
        } finally {
            setLoadingPautas(false);
        }
    };

    const loadTemas = async () => {
        try {
            setLoadingTemas(true);
            const themesData = await getAllThemes();
            // Cargar asignaturas del usuario para obtener los nombres
            const userId = user?.id ? parseInt(user.id) : undefined;
            const subjectsData = userId ? await getSubjectsByUser(userId) : [];
            setAsignaturas(subjectsData);
            
            // Transformar los temas al formato esperado
            const temasTransformados: Tema[] = themesData.map((theme: Theme) => {
                const asignatura = subjectsData.find((s: Subject) => s.subject_id === parseInt(theme.subject_id as unknown as string));
                return {
                    id: theme.theme_id,
                    nombre: theme.theme_name,
                    asignatura: asignatura?.subject_name || 'Sin asignatura',
                    subjectId: theme.subject_id as unknown as number,
                };
            });
            
            setTemas(temasTransformados);
        } catch (error) {
            console.error('Error al cargar temas:', error);
        } finally {
            setLoadingTemas(false);
        }
    };

    const loadEstudiantes = async () => {
        try {
            setLoadingEstudiantes(true);
            const data = await getAllStudents();
            
            // Transformar al formato esperado
            const estudiantesTransformados: Estudiante[] = data.map((e: EstudianteAPI) => ({
                id: e.user_id,
                nombre: e.user_name,
                rut: e.rut || 'Sin RUT',
            }));
            
            setEstudiantes(estudiantesTransformados);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
        } finally {
            setLoadingEstudiantes(false);
        }
    };

    const handleTemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const temaId = parseInt(e.target.value);
        const tema = temas.find(t => t.id === temaId) || null;
        setTemaSeleccionado(tema);
        
        // Buscar si existe pauta para este tema
        if (tema) {
            const pauta = pautas.find(p => p.theme_id === tema.id);
            setPautaSeleccionada(pauta || null);
        } else {
            setPautaSeleccionada(null);
        }
    };

    const handleToggleEstudiante = (estudianteId: number) => {
        setNuevaComision(prev => ({
            ...prev,
            estudiantesSeleccionados: prev.estudiantesSeleccionados.includes(estudianteId)
                ? prev.estudiantesSeleccionados.filter(id => id !== estudianteId)
                : [...prev.estudiantesSeleccionados, estudianteId]
        }));
    };

    const handleAgendarComision = () => {
        const estudiantesAsignados = estudiantes.filter(e =>
            nuevaComision.estudiantesSeleccionados.includes(e.id)
        );

        const nueva: Comision = {
            id: comisiones.length + 1,
            fecha: nuevaComision.fecha,
            hora: nuevaComision.hora,
            modalidad: nuevaComision.modalidad,
            lugar: nuevaComision.lugar,
            estudiantes: estudiantesAsignados,
        };

        setComisiones([...comisiones, nueva]);
        setShowModal(false);
        setNuevaComision({
            fecha: '',
            hora: '',
            modalidad: 'presencial',
            lugar: '',
            estudiantesSeleccionados: [],
        });
    };

    const handleCrearEvaluacion = () => {
        setVistaActual('crear');
        // Resetear estados
        setTemaSeleccionado(null);
        setNombrePauta('');
        setComisiones([]);
    };

    const handleVolverALista = () => {
        setVistaActual('lista');
        // Resetear estados
        setTemaSeleccionado(null);
        setNombrePauta('');
        setComisiones([]);
        setEvaluacionSeleccionada(null);
    };

    const handleVerDetalle = (evaluacion: Evaluacion) => {
        setEvaluacionSeleccionada(evaluacion);
        setVistaActual('detalle');
    };

    const handleGuardarEvaluacion = async () => {
        if (!temaSeleccionado || comisiones.length === 0 || !user?.id) return;

        try {
            const userId = parseInt(user.id);
            
            // Crear cada comisión en el backend
            for (const comision of comisiones) {
                const commissionData = {
                    commission_name: `Comisión ${comision.id} - ${temaSeleccionado.nombre}`,
                    user_id: userId,
                    theme_id: temaSeleccionado.id,
                    guideline_id: pautaSeleccionada?.guidline_id,
                    date: comision.fecha,
                    time: comision.hora,
                    location: comision.lugar,
                    estudiantes: comision.estudiantes.map(e => e.id),
                };
                
                await createCommission(commissionData);
            }

            // Recargar las comisiones desde el backend
            await loadComisiones();
            handleVolverALista();
        } catch (error) {
            console.error('Error al guardar evaluación:', error);
            alert('Error al guardar la evaluación. Por favor, intente de nuevo.');
        }
    };

    const estudiantesFiltrados = estudiantes.filter(e =>
        e.nombre.toLowerCase().includes(searchEstudiante.toLowerCase()) ||
        e.rut.includes(searchEstudiante)
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatDateShort = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getEstadoBadge = (estado: Evaluacion['estado']) => {
        switch (estado) {
            case 'borrador':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Borrador</span>;
            case 'programada':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Programada</span>;
            case 'en_curso':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">En curso</span>;
            case 'finalizada':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Finalizada</span>;
        }
    };

    const getProximaFecha = (evaluacion: Evaluacion) => {
        if (evaluacion.comisiones.length === 0) return 'Sin fecha';
        const fechas = evaluacion.comisiones.map(c => c.fecha).sort();
        return formatDateShort(fechas[0]);
    };

    // ==================== VISTA DE LISTA ====================
    if (vistaActual === 'lista') {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <Header variant="default" title="Facultad de Derecho" />

                <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                    <div className="max-w-6xl mx-auto space-y-6">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between rounded-lg bg-white mb-8 gap-4 shadow-md p-6 border-l-4 border-[#003366] min-h-[112px]">
                            <div>
                                <h1 className="text-2xl font-bold text-[#003366]">Gestión de Evaluaciones</h1>
                                <p className="text-sm text-gray-500 mt-1">Administre sus evaluaciones orales y comisiones asignadas.</p>
                            </div>
                            <button
                                onClick={handleCrearEvaluacion}
                                className="inline-flex items-center px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm font-bold shadow-sm"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Crear Evaluación
                            </button>
                        </div>

                        {/* Filtros rápidos */}
                        <div className="flex gap-2 flex-wrap">
                            <button className="px-4 py-2 bg-[#003366] text-white rounded-lg text-sm font-bold">
                                Todas ({evaluaciones.length})
                            </button>
                            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50">
                                Programadas ({evaluaciones.filter(e => e.estado === 'programada').length})
                            </button>
                            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50">
                                Borradores ({evaluaciones.filter(e => e.estado === 'borrador').length})
                            </button>
                            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50">
                                Finalizadas ({evaluaciones.filter(e => e.estado === 'finalizada').length})
                            </button>
                        </div>

                        {/* Lista de Evaluaciones */}
                        {loadingEvaluaciones ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                                <svg className="w-12 h-12 text-[#003366] mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <p className="text-gray-500">Cargando evaluaciones...</p>
                            </div>
                        ) : evaluaciones.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay evaluaciones creadas</h3>
                                <p className="text-gray-500 mb-6">Comience creando su primera evaluación oral.</p>
                                <button
                                    onClick={handleCrearEvaluacion}
                                    className="inline-flex items-center px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm font-bold"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Crear Evaluación
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {evaluaciones.map((evaluacion) => (
                                    <div
                                        key={evaluacion.id}
                                        className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-800">{evaluacion.tema.nombre}</h3>
                                                    {getEstadoBadge(evaluacion.estado)}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{evaluacion.tema.asignatura}</p>
                                                
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <span>{evaluacion.totalEstudiantes} estudiantes</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                        <span>{evaluacion.comisiones.length} comisión(es)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleVerDetalle(evaluacion)}
                                                className="inline-flex items-center px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm font-bold"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Gestionar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </main>

                <BottomNavigation />
            </div>
        );
    }

    // ==================== VISTA DE DETALLE ====================
    if (vistaActual === 'detalle' && evaluacionSeleccionada) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <Header variant="default" title="Facultad de Derecho" />

                <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                    <div className="max-w-6xl mx-auto space-y-6">

                        {/* Header Section con botón de volver */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003366] min-h-[112px] flex flex-col justify-center">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleVolverALista}
                                    className="p-2 text-gray-500 hover:text-[#003366] hover:bg-gray-100 rounded-lg transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold text-[#003366]">{evaluacionSeleccionada.tema.nombre}</h1>
                                        {getEstadoBadge(evaluacionSeleccionada.estado)}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {evaluacionSeleccionada.tema.asignatura} • {evaluacionSeleccionada.nombrePauta}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Resumen de la evaluación */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{evaluacionSeleccionada.comisiones.length}</p>
                                        <p className="text-sm text-gray-500">Comisiones</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{evaluacionSeleccionada.totalEstudiantes}</p>
                                        <p className="text-sm text-gray-500">Estudiantes</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{formatDateShort(evaluacionSeleccionada.fechaCreacion)}</p>
                                        <p className="text-sm text-gray-500">Fecha de creación</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Título de sección */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#003366]">Comisiones de esta evaluación</h2>
                        </div>

                        {/* Lista de Comisiones */}
                        <div className="grid gap-4">
                            {evaluacionSeleccionada.comisiones.map((comision) => (
                                <div
                                    key={comision.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${comision.modalidad === 'presencial' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {comision.modalidad === 'presencial' ? '📍 Presencial' : '💻 Online'}
                                                </span>
                                                <span className="text-sm text-gray-500">Comisión #{comision.id}</span>
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
                                        <div className="flex flex-col gap-2 min-w-[160px]">
                                            {!comision.evaluada ? (
                                                <>
                                                    <button
                                                        onClick={() => navigate(`/RealizarEvaluacion?evaluacionId=${evaluacionSeleccionada.id}&comisionId=${comision.id}`)}
                                                        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Realizar Evaluación
                                                    </button>
                                                    <button
                                                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                        Editar Comisión
                                                    </button>
                                                    <button
                                                        className="inline-flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Eliminar Comisión
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Ver Resultados
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </main>

                <BottomNavigation />
            </div>
        );
    }

    // ==================== VISTA DE CREACIÓN ====================
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header variant="default" title="Facultad de Derecho" />

            <main className="flex-1 z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-24">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Header Section con botón de volver */}
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003366] min-h-[112px] flex flex-col justify-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleVolverALista}
                                className="p-2 text-gray-500 hover:text-[#003366] hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-[#003366]">Crear Nueva Evaluación</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Configure la logística del examen vinculando un tema con las comisiones y la pauta de evaluación.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Paso 1: Selector de Tema */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#003366] text-white font-bold text-sm">1</span>
                            <h2 className="text-lg font-bold text-[#003366]">Seleccionar Tema a Evaluar</h2>
                        </div>

                        <div className="relative">
                            <select
                                value={temaSeleccionado?.id || ''}
                                onChange={handleTemaChange}
                                disabled={loadingTemas}
                                className="block w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition disabled:opacity-50"
                            >
                                <option value="" disabled>
                                    {loadingTemas ? 'Cargando temas...' : 'Seleccione un tema para evaluar...'}
                                </option>
                                {temas.map(tema => (
                                    <option key={tema.id} value={tema.id}>
                                        {tema.asignatura} - {tema.nombre}
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

                    {/* Paneles de configuración (solo si hay tema seleccionado) */}
                    {temaSeleccionado && (
                        <>
                            {/* Panel A: Configuración de Pauta */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#003366] text-white font-bold text-sm">A</span>
                                    <h2 className="text-lg font-bold text-[#003366]">Configuración de Pauta (Guideline)</h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Estado de la pauta */}
                                    <div className={`flex items-center gap-3 p-4 rounded-lg ${pautaSeleccionada ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                        {pautaSeleccionada ? (
                                            <>
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="font-semibold text-green-800">Pauta asignada</p>
                                                    <p className="text-sm text-green-700">{pautaSeleccionada.name}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div>
                                                    <p className="font-semibold text-yellow-800">Sin pauta asignada</p>
                                                    <p className="text-sm text-yellow-700">Debe vincular una pauta de evaluación a este tema.</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {pautaSeleccionada ? (
                                        <button
                                            onClick={() => navigate(`/add-guidelines?id=${pautaSeleccionada.guidline_id}&themeId=${temaSeleccionado?.id}`)}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Editar Pauta
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/add-guidelines?themeId=${temaSeleccionado?.id}`)}
                                            className="inline-flex items-center px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm font-bold"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Crear Pauta
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Panel B: Gestión de Comisiones */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#003366] text-white font-bold text-sm">B</span>
                                        <h2 className="text-lg font-bold text-[#003366]">Gestión de Comisiones (Logística)</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="inline-flex items-center px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm font-bold"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Nueva Comisión
                                    </button>
                                </div>

                                {/* Grid de Comisiones */}
                                {comisiones.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 font-medium">No hay comisiones creadas</p>
                                        <p className="text-sm text-gray-400 mt-1">Haga clic en "Nueva Comisión" para comenzar</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {comisiones.map((comision) => (
                                            <div
                                                key={comision.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${comision.modalidad === 'presencial' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                            {comision.modalidad === 'presencial' ? '📍 Presencial' : '💻 Online'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Editar">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition" title="Eliminar">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
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
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="text-sm truncate" title={comision.lugar}>{comision.lugar}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-gray-100">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                            </svg>
                                                            <span className="text-sm text-gray-600">{comision.estudiantes.length} estudiantes</span>
                                                        </div>
                                                        <button className="text-xs text-[#003366] hover:underline font-medium">
                                                            Ver lista
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pie de Página / Acciones Globales */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-center sm:text-left">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">{comisiones.length}</span> comisión(es) configurada(s) para este tema
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Los estudiantes recibirán una notificación por correo electrónico
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleVolverALista}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleGuardarEvaluacion}
                                            disabled={comisiones.length === 0}
                                            className="inline-flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Guardar Evaluación
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </main>

            {/* Modal de Nueva Comisión */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                        ></div>

                        {/* Modal Content */}
                        <div className="relative inline-block w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-[#003366]">Nueva Comisión</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Fecha y Hora */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Fecha <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={nuevaComision.fecha}
                                            onChange={(e) => setNuevaComision({ ...nuevaComision, fecha: e.target.value })}
                                            className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Hora <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={nuevaComision.hora}
                                            onChange={(e) => setNuevaComision({ ...nuevaComision, hora: e.target.value })}
                                            className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                        />
                                    </div>
                                </div>

                                {/* Modalidad */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                        Modalidad <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${nuevaComision.modalidad === 'presencial' ? 'border-[#003366] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input
                                                type="radio"
                                                name="modalidad"
                                                value="presencial"
                                                checked={nuevaComision.modalidad === 'presencial'}
                                                onChange={(e) => setNuevaComision({ ...nuevaComision, modalidad: e.target.value as 'presencial' | 'online' })}
                                                className="sr-only"
                                            />
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-medium text-gray-700">Presencial</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${nuevaComision.modalidad === 'online' ? 'border-[#003366] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input
                                                type="radio"
                                                name="modalidad"
                                                value="online"
                                                checked={nuevaComision.modalidad === 'online'}
                                                onChange={(e) => setNuevaComision({ ...nuevaComision, modalidad: e.target.value as 'presencial' | 'online' })}
                                                className="sr-only"
                                            />
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span className="font-medium text-gray-700">Online</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Lugar / Enlace */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                        {nuevaComision.modalidad === 'presencial' ? 'Lugar Físico' : 'Enlace de Reunión'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type={nuevaComision.modalidad === 'online' ? 'url' : 'text'}
                                        value={nuevaComision.lugar}
                                        onChange={(e) => setNuevaComision({ ...nuevaComision, lugar: e.target.value })}
                                        className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                                        placeholder={nuevaComision.modalidad === 'presencial' ? 'Ej: Sala 301, Edificio de Derecho' : 'Ej: https://meet.google.com/...'}
                                    />
                                </div>

                                {/* Selector de Estudiantes */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                        Asignar Estudiantes <span className="text-red-500">*</span>
                                    </label>

                                    {/* Buscador */}
                                    <div className="relative mb-3">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={searchEstudiante}
                                            onChange={(e) => setSearchEstudiante(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] text-sm transition"
                                            placeholder="Buscar por nombre o RUT..."
                                        />
                                    </div>

                                    {/* Lista de Estudiantes */}
                                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                                        {estudiantesFiltrados.map((estudiante) => (
                                            <label
                                                key={estudiante.id}
                                                className={`flex items-center gap-3 p-3 cursor-pointer transition ${nuevaComision.estudiantesSeleccionados.includes(estudiante.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={nuevaComision.estudiantesSeleccionados.includes(estudiante.id)}
                                                    onChange={() => handleToggleEstudiante(estudiante.id)}
                                                    className="w-4 h-4 text-[#003366] border-gray-300 rounded focus:ring-[#003366]"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{estudiante.nombre}</p>
                                                    <p className="text-xs text-gray-500">{estudiante.rut}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    <p className="text-xs text-gray-500 mt-2">
                                        {nuevaComision.estudiantesSeleccionados.length} estudiante(s) seleccionado(s)
                                    </p>
                                </div>
                            </div>

                            {/* Acciones del Modal */}
                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAgendarComision}
                                    disabled={!nuevaComision.fecha || !nuevaComision.hora || !nuevaComision.lugar || nuevaComision.estudiantesSeleccionados.length === 0}
                                    className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Agendar Comisión
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <BottomNavigation />
        </div>
    );
}