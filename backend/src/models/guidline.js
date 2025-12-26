import { EntitySchema } from 'typeorm';

export const Guidline = new EntitySchema({
    name: 'Guidline',
    tableName: 'guidline',
    columns: {
        guidline_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        name: {
            type: 'varchar',
            length: 200,
            nullable: false,
        },
        theme_id: {
            type: 'int',
            nullable: false,
        },
    },
    relations: {
        theme: {
            target: 'theme',
            type: 'one-to-one',
            joinColumn: {
                name: 'theme_id',
            },
            onDelete: 'RESTRICT',
        },
    },
});