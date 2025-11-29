import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token del header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado. Acceso denegado.',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Agregar los datos del usuario al request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor, inicie sesión nuevamente.',
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Token inválido. Acceso denegado.',
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado',
            });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para acceder a este recurso',
            });
        }

        next();
    };
};