import { EntitySchema } from 'typeorm';

export const Questions = new EntitySchema({
    name: 'Questions',
    tableName: 'questions',
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
        created_by: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
        category_id: {
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
        category: {
            target: 'categories', 
            type: 'many-to-one', 
            joinColumn: {
                name: 'category_id', 
            },
            onDelete: 'RESTRICT', 
        },
    },
});
