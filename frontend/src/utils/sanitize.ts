/**
 * Sanitiza una cadena de texto para prevenir inyección XSS
 * Elimina tags HTML y caracteres peligrosos
 */
export const sanitizeString = (input: string): string => {
    if (typeof input !== 'string') return '';
    
    return input
        // Eliminar tags HTML
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        // Escapar caracteres especiales
        .replace(/[<>]/g, '')
        .trim();
};

/**
 * Sanitiza un objeto completo recursivamente
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
    const sanitized = {} as T;
    
    for (const key in obj) {
        const value = obj[key];
        
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value) as T[Extract<keyof T, string>];
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map((item: any) => 
                typeof item === 'string' ? sanitizeString(item) : 
                typeof item === 'object' && item !== null ? sanitizeObject(item) : 
                item
            ) as T[Extract<keyof T, string>];
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

/**
 * Valida que un string no contenga caracteres peligrosos
 */
export const isValidInput = (input: string): boolean => {
    const dangerous = /<script|javascript:|onerror=|onload=/i;
    return !dangerous.test(input);
};

/**
 * Sanitiza una URL para prevenir javascript: o data: URLs
 */
export const sanitizeUrl = (url: string): string => {
    if (!url) return '';
    
    const trimmed = url.trim();
    
    // Solo permitir http, https y enlaces relativos
    if (!trimmed.match(/^(https?:\/\/|\/)/i)) {
        return '';
    }
    
    // Bloquear javascript: y data: URLs
    if (trimmed.match(/^(javascript|data):/i)) {
        return '';
    }
    
    return trimmed;
};
