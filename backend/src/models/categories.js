import { EntitySchema } from 'typeorm';

export const Categories = new EntitySchema({
    name: 'Categories',
    tableName: 'categories',
    columns: {
        id_category: {
            type: 'int',
            primary: true,
            generated: true,
        },
        name: {
            type: 'varchar',
            length: 100,
            nullable: false,
            unique: true,
        },
        description: {
            type: 'text',
            nullable: true, 
        },
    },
});