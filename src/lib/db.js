import postgress from 'pg';
const { Pool } = postgress;

const pool = new Pool({
    connectionString: import.meta.env.DATABASE_URL
});

export async function GetDestinos() {
    const res = await pool.query('SELECT * FROM tours ORDER BY id');
    return res.rows;
    
}