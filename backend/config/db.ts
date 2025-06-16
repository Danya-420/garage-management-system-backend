import dotenv from 'dotenv';
dotenv.config();

import sql from 'mssql';

export const dbConfig: sql.config = {
  user: process.env.DB_USER || 'default_user',
  password: process.env.DB_PASSWORD || 'default_password',
  database: process.env.DB_NAME || 'default_db',
  server: process.env.DB_SERVER || 'localhost',
  port: 1433, 
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

console.log('DB Config:', dbConfig);

export const connectToDb = async () => {
  try {
    if (!process.env.DB_SERVER) {
      throw new Error('DB_SERVER environment variable is not defined');
    }
    const pool = await sql.connect(dbConfig);
    console.log('Connected to SQL Server:', pool.connected);
    return pool;
  } catch (err: any) {
    console.error('DB connection error:', {
      message: err.message,
      code: err.code,
      originalError: err.originalError?.message
    });
    throw err;
  }
};

export default sql;