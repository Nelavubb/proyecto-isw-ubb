import express from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database.js';
import { User } from '../models/user.js';

const router = express.Router();

const userRepository = () => AppDataSource.getRepository(User);

// Función para extraer los últimos 5 dígitos del RUT (sin verificador)
const generatePasswordFromRUT = (rut) => {
    // Remover puntos y guiones: "12.345.678-9" => "123456789"
    const cleanRUT = rut.replace(/[.-]/g, '');
    // Obtener los últimos 5 dígitos antes del verificador (últimos 6 caracteres menos 1)
    // Si el RUT es "123456789", queremos "45678" (posiciones 3-8)
    const password = cleanRUT.slice(-6, -1);
    return password;
};

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await userRepository().find({
            select: ['user_id', 'rut', 'user_name', 'role']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
    }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userRepository().findOne({
            where: { user_id: parseInt(id) },
            select: ['user_id', 'rut', 'user_name', 'role']
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuario', details: error.message });
    }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
    try {
        const { rut, user_name, role, } = req.body;

        // Validar campos requeridos
        if (!rut || !user_name || !role) {
            return res.status(400).json({ error: 'RUT, nombre de usuario y rol son obligatorios' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await userRepository().findOne({ where: { rut } });
        if (existingUser) {
            return res.status(409).json({ error: 'El RUT ya está registrado' });
        }

        // Crear nuevo usuario con contraseña basada en últimos 5 dígitos del RUT
        const plainPassword = generatePasswordFromRUT(rut);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const newUser = userRepository().create({
            rut,
            user_name,
            role,
            password: hashedPassword
        });

        const savedUser = await userRepository().save(newUser);

        // Retornar sin la contraseña
        const { password: _, ...userWithoutPassword } = savedUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear usuario', details: error.message });
    }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rut, user_name, role } = req.body;

        const user = await userRepository().findOne({ where: { user_id: parseInt(id) } });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (rut) user.rut = rut;
        if (user_name) user.user_name = user_name;
        if (role) user.role = role;

        const updatedUser = await userRepository().save(user);

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario', details: error.message });
    }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userRepository().findOne({ where: { user_id: parseInt(id) } });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await userRepository().remove(user);

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario', details: error.message });
    }
});

export default router;
