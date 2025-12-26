import { EntitySchema } from 'typeorm';

export const User = new EntitySchema({
    name: 'User',
    tableName: 'user',
    columns: {
        user_id: {
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
        user_name: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
        role: {
            type: 'varchar',
            length: 50,
            default: 'estudiante',
            nullable: false,
        },
    },
});