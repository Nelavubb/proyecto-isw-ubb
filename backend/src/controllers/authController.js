import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database.js';
import { User } from '../models/user.js';
import { registerValidation, loginValidation } from '../validations/userValidation.js';
import dotenv from 'dotenv';

dotenv.config();

const userRepository = () => AppDataSource.getRepository(User);

// Generar JWT
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.user_id,
            rut: user.rut,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Registro de usuario
export const register = async (req, res) => {
    try {
        // Validar datos de entrada con Joi
        const { error, value } = registerValidation.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: error.details.map(detail => detail.message),
            });
        }

        const { rut, password, user_name, role } = value;

        // Verificar si el usuario ya existe
        const existingUser = await userRepository().findOne({ where: { rut } });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El rut ya está registrado',
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const newUser = userRepository().create({
            rut: rut,
            password: hashedPassword,
            user_name: user_name || null,
            role: role || 'estudiante',
        });

        await userRepository().save(newUser);

        // Generar token
        const token = generateToken(newUser);

        // Eliminar password de la respuesta
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: userWithoutPassword,
                token,
            },
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
        });
    }
};

// Login de usuario
export const login = async (req, res) => {
    try {
        // Validar datos de entrada con Joi
        const { error, value } = loginValidation.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: error.details.map(detail => detail.message),
            });
        }

        const { rut, password } = value;

        // Buscar usuario por rut
        const user = await userRepository().findOne({ where: { rut } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
            });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
            });
        }

        // Generar token
        const token = generateToken(user);

        // Eliminar password de la respuesta
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                user: userWithoutPassword,
                token,
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
        });
    }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userRepository().findOne({ where: { user_id: userId } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
            });
        }

        // Eliminar password de la respuesta
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            data: userWithoutPassword,
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
        });
    }
};