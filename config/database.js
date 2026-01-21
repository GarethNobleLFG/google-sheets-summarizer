require('dotenv').config();
const { Pool } = require('pg');

let pool;

if (process.env.DB_CONNECTION_TYPE === 'local') {
    // For local development PostgreSQL server.
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
}
else {
    // Connect to external PostgreSQL databse (configured for Railway).
    pool = new Pool({
        connectionString: process.env.DATABASE_PUBLIC_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
}


pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});


module.exports = pool;