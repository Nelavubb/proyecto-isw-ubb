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
        commission_id: {
            type: 'int',
            nullable: false,
        },
        guidline_id: {
            type: 'int',
            nullable: true,
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
        created_at: {
            type: 'timestamp',
            createDate: true,
        },
        status: {
            type: 'varchar',
            length: 20,
            enum: ['pending', 'completed'],
            default: 'pending',
            nullable: false,
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
            type: 'one-to-many',
            joinColumn: {
                name: 'user_id',
            },
            onDelete: 'CASCADE',
        },
        commission: {
            target: 'commission',
            type: 'many-to-one',
            joinColumn: {
                name: 'commission_id',
            },
            onDelete: 'CASCADE',
        },
    },
});

