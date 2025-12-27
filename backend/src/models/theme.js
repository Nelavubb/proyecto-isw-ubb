import { EntitySchema } from 'typeorm';

export const Theme = new EntitySchema({
    name: 'Theme',
    tableName: 'theme',
    columns: {
        theme_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        theme_name: {
            type: 'varchar',
            length: 300,
            nullable: false,
            unique: true,
        },
        subject_id: {
            type: 'int',
            nullable: true,
        },
    },
    relations: {
        subject: {
            target: 'subject',
            type: 'many-to-one',
            joinColumn: {
                name: 'subject_id',
            },
            onDelete: 'CASCADE',
        },
    },
});