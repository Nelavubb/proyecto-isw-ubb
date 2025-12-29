export const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    };
    return date.toLocaleDateString('es-CL', options);
};

export const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-CL', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
};

export const resetComisionForm = () => ({
    fecha: '',
    hora: '',
    modalidad: 'presencial' as 'presencial' | 'online',
    lugar: '',
    estudiantesSeleccionados: [] as number[],
});
