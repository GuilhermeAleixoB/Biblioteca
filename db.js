import pg from 'pg'
const { Pool, Client } = pg

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '123',
  port: 5432,
})

pool.on('connect', () => {
    console.log('Base de Dados conectado com sucesso!');
  });
  
  export default {
    query: (text, params) => pool.query(text, params),
  };
  