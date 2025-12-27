
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'evaluaciones_orales',
    synchronize: false,
    logging: true,
    entities: [],
});

const fixForeignKey = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected.');

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        console.log('Dropping old constraint...');
        // Drop the existing constraint
        await queryRunner.query('ALTER TABLE "question" DROP CONSTRAINT IF EXISTS "FK_e2b3723d4ee59480c1b8641c1a7"');

        console.log('Adding new constraint with CASCADE...');
        // Add new constraint with ON DELETE CASCADE
        // Note: We assume "theme_id" is the column in "question" and "theme_id" is the PK in "theme".
        await queryRunner.query(`
            ALTER TABLE "question" 
            ADD CONSTRAINT "FK_e2b3723d4ee59480c1b8641c1a7" 
            FOREIGN KEY ("theme_id") 
            REFERENCES "theme"("theme_id") 
            ON DELETE CASCADE
        `);

        console.log('Constraint updated successfully.');
        await queryRunner.release();
        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error fixing foreign key:', error);
        process.exit(1);
    }
};

fixForeignKey();
