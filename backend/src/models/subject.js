import { EntitySchema } from 'typeorm';

export const Subject = new EntitySchema({
    name: 'Subject',
    tableName: 'subject',
    columns: {
        subject_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        user_id: {
            type: 'int',
            nullable: false,
        },
        term_id: {
            type: 'int',
            nullable: true,
        },
        subject_name: {
            type: 'varchar',
            length: 200,
            nullable: false,
            unique: false,
        },
    },
    relations: {
        user: {
            target: 'User',
            type: 'many-to-one',
            joinColumn: {
                name: 'user_id',
            },
            onDelete: 'RESTRICT',

        },
        term: {
            target: 'Term',
            type: 'many-to-one',
            joinColumn: {
                name: 'term_id',
            },
            onDelete: 'RESTRICT',

        },
    },
});