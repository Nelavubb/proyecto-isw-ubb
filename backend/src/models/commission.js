import { EntitySchema } from 'typeorm';

export const Commission = new EntitySchema({
    name: 'Commission',
    tableName: 'commission',
    columns: {
        commission_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        user_id: {
            type: 'int',
            nullable: false,
        },
        theme_id: {
            type: 'int',
            nullable: false,
        },
        commission_name: {
            type: 'varchar',
            length: 200,
            nullable: false,
            unique: true,
        },
        date: {
            type: 'date',
            nullable: false,
        },
        time: {
            type: 'time',
            nullable: false,
        },
        location: {
            type: 'varchar',
            length: 300,
            nullable: false,
        },
    },
    relations: {
        user: {
            target: 'user',
            type: 'many-to-one',
            joinColumn: {
                name: 'user_id',
            },
            onDelete: 'RESTRICT',
        },
        theme: {
            target: 'theme',
            type: 'many-to-one',
            joinColumn: {
                name: 'theme_id',
            },
            onDelete: 'RESTRICT',
        },
    },
});


