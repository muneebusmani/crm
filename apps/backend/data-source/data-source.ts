import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` }); // same env loader as Nest

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // synchronize: process.env.NODE_ENV !== 'production',
  synchronize: false,
  entities: [`${__dirname}/src/**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/src/migrations/*{.ts,.js}`],
});
