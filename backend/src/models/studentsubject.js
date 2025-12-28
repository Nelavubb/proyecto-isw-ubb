import { EntitySchema } from 'typeorm';

export const Student_Subject = new EntitySchema({
    name: 'Student_Subject',
    tableName: 'student_subject',
    columns: {
        student_subject_id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        user_id: {
            type: 'int',
            nullable: false,
        },
        subject_id: {
            type: 'int',
            nullable: false,
        },
        status: {
            type: 'enum',
            enum: ['active', 'inactive'],
            default: 'active',
            nullable: false,
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
        subject: {
            target: 'Subject',
            type: 'many-to-one',
            joinColumn: {
                name: 'subject_id',
            },
            onDelete: 'CASCADE',
        },
    },
});