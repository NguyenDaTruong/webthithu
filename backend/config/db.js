const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

let pool;

async function connectDB() {
  try {
    pool = await sql.connect(config);
    console.log('Connected to SQL Server successfully');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

async function getPool() {
  if (!pool) {
    await connectDB();
  }
  return pool;
}

module.exports = { getPool, connectDB };