import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set');
}

const connection = await mysql.createConnection(url);

const [tables] = await connection.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
  ORDER BY table_name
`);

const [migrationsExistsRows] = await connection.query(`
  SELECT COUNT(*) AS count
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = '__drizzle_migrations'
`);

let migrations = [];
if (migrationsExistsRows[0]?.count > 0) {
  const [migrationRows] = await connection.query('SELECT * FROM __drizzle_migrations ORDER BY id');
  migrations = migrationRows;
}

console.log(JSON.stringify({ tables, migrations }, null, 2));
await connection.end();
