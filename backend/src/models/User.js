import { EntitySchema } from 'typeorm';

export const User = new EntitySchema({
    name: 'User',
    tableName: 'users',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        rut: {
            type: 'varchar',
            length: 20,
            nullable: false,
        },
        password: {
            type: 'varchar',
            length: 255,
            nullable: false,
        },
        nombre: {
            type: 'varchar',
            length: 100,
            nullable: true,
        },
        apellido: {
            type: 'varchar',
            length: 100,
            nullable: true,
        },
        rol: {
            type: 'varchar',
            length: 50,
            default: 'estudiante',
            nullable: false,
        },
    },
});