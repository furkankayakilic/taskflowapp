import pool from './config/database';

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    client.release();
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
  } finally {
    pool.end();
  }
}

testConnection(); 