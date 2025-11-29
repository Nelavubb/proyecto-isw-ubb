import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'evaluaciones_orales',
    synchronize: process.env.NODE_ENV === 'development', // Solo en desarrollo
    logging: process.env.NODE_ENV === 'development',
    entities: ['src/models/**/*.js'],
    migrations: ['src/migrations/**/*.js'],
    subscribers: ['src/subscribers/**/*.js'],
});

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Base de datos conectada exitosamente');
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};