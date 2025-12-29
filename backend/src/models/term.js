import { EntitySchema } from 'typeorm';

export const Term = new EntitySchema({
    name: 'Term',
    tableName: 'term',
    columns: {
        term_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        code: {
            type: 'varchar',
            length: 10,
            nullable: false,
            unique: true,
        },
        is_current: {
            type: 'boolean',
            nullable: false,
        },
    },
});