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
        subject_name: {
            type: 'varchar',
            length: 200,
            nullable: false,
            unique: true,
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
    },
});
