import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './src/config/database.js';
import routes from './src/routes/indexRoutes.js';
import questionsRoutes from './src/routes/questionRoutes.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas
app.use('/api', routes);
app.use('/api/questions', questionsRoutes);
// Ruta raíz
app.get('/', (req, res) => {
    res.send('API de Gestión de Evaluaciones Orales');
});

// Manejo de rutas no encontradas
app.use(cors(), (req, res) => {
    res.sendStatus(404);
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Inicializar base de datos y servidor
const startServer = async () => {
    try {
        // Conectar a la base de datos
        await initializeDatabase();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📚 Documentación API: http://localhost:${PORT}/api/health`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();