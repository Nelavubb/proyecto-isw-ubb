import { EntitySchema } from 'typeorm';

export const Questions = new EntitySchema({
    name: 'Questions',
    tableName: 'question',
    columns: {
        id_question: {
            type: 'int',
            primary: true,
            generated: true,
        },
        question_text: {
            type: 'text',
            nullable: false,
        },
        answer: {
            type: 'text',
            nullable: false,
        },
        user_id: {
            type: 'int',
            nullable: false,
        },
        theme_id: {
            type: 'int',
            nullable: false,
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
        },
        updated_at: {
            type: 'timestamp',
            updateDate: true,
        }
    },
    relations: {
        theme: {
            target: 'theme',
            type: 'many-to-one',
            joinColumn: {
                name: 'theme_id',
            },
            onDelete: 'CASCADE',
        },
        user: {
            target: 'user',
            type: 'many-to-one',
            joinColumn: {
                name: 'user_id',
            },
            onDelete: 'RESTRICT',
        },
    },
});
