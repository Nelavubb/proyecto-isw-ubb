import { EntitySchema } from 'typeorm';

export const score_detail = new EntitySchema({
    name: 'score_detail',
    tableName: 'score_detail',
    columns: {
        score_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        actual_score: {
            type: 'float',
            nullable: false,

        },
        criterion_id: {
            type: 'int',
            nullable: false,
        },
        evaluation_detail_id: {
            type: 'int',
            nullable: false,
        },
    },

    relations: {
        criterion: {
            target: 'criterion',
            type: 'many-to-one',
            joinColumn: {
                name: 'criterion_id',
            },
            onDelete: 'RESTRICT',
        },
        evaluation_detail: {
            target: 'evaluation_details',
            type: 'many-to-one',
            joinColumn: {
               name: 'evaluation_detail_id',
            },
            onDelete: 'CASCADE',
        },
    },
});
