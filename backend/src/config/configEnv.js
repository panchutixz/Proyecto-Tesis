"use strict";
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
// Load .env from the original database/config folder to keep existing values
// from `backend/src/config` we need to go up three levels to reach the repo root
const envFilePath = path.resolve(_dirname, '../../../database/config/.env');

dotenv.config({ path: envFilePath });

export const HOST = process.env.DB_HOST || process.env.HOST || 'localhost';
export const PORT = process.env.PORT || 3000;
export const DB_PORT = process.env.DB_PORT || 5432;
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DATABASE = process.env.DATABASE;
export const JWT_SECRET = process.env.JWT_SECRET;
export const cookieKey = process.env.COOKIE_KEY;
