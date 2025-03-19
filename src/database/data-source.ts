import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

export default new DataSource({
  type: process.env.DB_TYPE as 'postgres',
  url: process.env.DB_URL,
  synchronize: false,
  logging: false,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  ...(process.env.ENV === 'prod' && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});
