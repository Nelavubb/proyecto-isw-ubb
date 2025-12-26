import { EntitySchema } from 'typeorm';


export const Evaluation_detail = new EntitySchema({
    name: 'Evaluation_detail',
    tableName: 'evaluation_details',
    columns: {
        evaluation_detail_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        user_id: {
            type: 'int',
            nullable: false,
        },
        commision_id: {
            type: 'int',
            nullable: false,
        },
        guidline_id: {
            type: 'int',
            nullable: false,
        },
        observation: {
            type: 'text',
            nullable: true,
        },
        question_asked: {
            type: 'text',
            nullable: true,
        },
        grade: {
            type: 'float',
            nullable: true,
        },
    },
    relations: {
        guidline: {
            target: 'guidline',
            type: 'many-to-one',
            joinColumn: {
                name: 'guidline_id',
            },
            onDelete: 'RESTRICT',
        },
        user: {
            target: 'user',
            type: 'many-to-one',
            joinColumn: {
                name: 'user_id',
            },
            onDelete: 'CASCADE',
        },
        commision: {
            target: 'commission',
            type: 'many-to-one',
            joinColumn: {
                name: 'commision_id',
            },
            onDelete: 'CASCADE',
        },
    },
});

