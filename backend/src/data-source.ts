import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: 'Reroco34',
	database: 'db_chat',
	name: 'default',
	synchronize: false,
	logging: true,
	entities: ['build/entity/**/*.{ts,js}'],
	migrations: ['build/migration/**/*.{ts,js}'],
	subscribers: ['src/subscribers/*{.ts,.js}'],
	// migrationsRun: true,
	// migrationsTableName: 'custom_table',
});
