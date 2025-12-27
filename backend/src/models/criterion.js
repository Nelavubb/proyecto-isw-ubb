import { EntitySchema } from 'typeorm';

export const Criterion = new EntitySchema({
    name: 'Criterion',
    tableName: 'criterion',
    columns: {
        criterion_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        scor_max: {
            type: 'float',
            nullable: false,
        },
        description: {
            type: 'text',
            nullable: true,
        },
        guidline_id: {
            type: 'int',
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
            onDelete: 'CASCADE',
        },
    },
});

