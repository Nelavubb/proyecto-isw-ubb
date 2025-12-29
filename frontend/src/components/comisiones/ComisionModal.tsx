import React from 'react';

interface Estudiante {
    id: number;
    nombre: string;
    rut: string;
}

interface NuevaComision {
    fecha: string;
    hora: string;
    modalidad: 'presencial' | 'online';
    lugar: string;
    estudiantesSeleccionados: number[];
}

interface ComisionModalProps {
    show: boolean;
    modoEdicion: boolean;
    modalContext: 'crear' | 'detalle';
    nuevaComision: NuevaComision;
    estudiantes: Estudiante[];
    loadingEstudiantes: boolean;
    searchEstudiante: string;
    onClose: () => void;
    onSubmit: () => void;
    onChange: (comision: NuevaComision) => void;
    onSearchChange: (search: string) => void;
}

const ComisionModal: React.FC<ComisionModalProps> = ({
    show,
    modoEdicion,
    modalContext,
    nuevaComision,
    estudiantes,
    loadingEstudiantes,
    searchEstudiante,
    onClose,
    onSubmit,
    onChange,
    onSearchChange,
}) => {
    if (!show) return null;

    const estudiantesFiltrados = estudiantes.filter(e =>
        e.nombre.toLowerCase().includes(searchEstudiante.toLowerCase()) ||
        e.rut.includes(searchEstudiante)
    );

    const toggleEstudiante = (id: number) => {
        const selected = nuevaComision.estudiantesSeleccionados.includes(id)
            ? nuevaComision.estudiantesSeleccionados.filter(eid => eid !== id)
            : [...nuevaComision.estudiantesSeleccionados, id];
        onChange({ ...nuevaComision, estudiantesSeleccionados: selected });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 z-10 relative animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#003366]">
                        {modoEdicion ? 'Editar Comisión' : 'Nueva Comisión'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                onChange={(e) => onChange({ ...nuevaComision, fecha: e.target.value })}
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
                                onChange={(e) => onChange({ ...nuevaComision, hora: e.target.value })}
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
                            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                                nuevaComision.modalidad === 'presencial' 
                                    ? 'border-[#003366] bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="modalidad"
                                    value="presencial"
                                    checked={nuevaComision.modalidad === 'presencial'}
                                    onChange={(e) => onChange({ ...nuevaComision, modalidad: e.target.value as 'presencial' | 'online' })}
                                    className="sr-only"
                                />
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium text-gray-700">Presencial</span>
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                                nuevaComision.modalidad === 'online' 
                                    ? 'border-[#003366] bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="modalidad"
                                    value="online"
                                    checked={nuevaComision.modalidad === 'online'}
                                    onChange={(e) => onChange({ ...nuevaComision, modalidad: e.target.value as 'presencial' | 'online' })}
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
                            onChange={(e) => onChange({ ...nuevaComision, lugar: e.target.value })}
                            className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition"
                            placeholder={nuevaComision.modalidad === 'presencial' ? 'Ej: Sala 301, Edificio de Derecho' : 'Ej: https://meet.google.com/...'}
                        />
                    </div>

                    {/* Selector de Estudiantes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Asignar Estudiantes <span className="text-red-500">*</span>
                        </label>

                        <div className="relative mb-3">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o RUT..."
                                value={searchEstudiante}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="block w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-10 rounded-lg focus:outline-none focus:bg-white focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                            />
                            <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {loadingEstudiantes ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                                {estudiantesFiltrados.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        No hay estudiantes disponibles
                                    </div>
                                ) : (
                                    estudiantesFiltrados.map((estudiante) => (
                                        <label
                                            key={estudiante.id}
                                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={nuevaComision.estudiantesSeleccionados.includes(estudiante.id)}
                                                onChange={() => toggleEstudiante(estudiante.id)}
                                                className="w-4 h-4 text-[#003366] border-gray-300 rounded focus:ring-[#003366]"
                                            />
                                            <div className="ml-3 flex-1">
                                                <p className="text-sm font-medium text-gray-900">{estudiante.nombre}</p>
                                                <p className="text-xs text-gray-500">{estudiante.rut}</p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                            {nuevaComision.estudiantesSeleccionados.length} estudiante(s) seleccionado(s)
                        </p>
                    </div>
                </div>

                {/* Acciones del Modal */}
                <div className="mt-6 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!nuevaComision.fecha || !nuevaComision.hora || !nuevaComision.lugar || nuevaComision.estudiantesSeleccionados.length === 0}
                        className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#004488] transition text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={modoEdicion ? "M5 13l4 4L19 7" : "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"} />
                            </svg>
                            {modoEdicion ? 'Guardar Cambios' : (modalContext === 'detalle' ? 'Agregar Comisión' : 'Agendar Comisión')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComisionModal;
