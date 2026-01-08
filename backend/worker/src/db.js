import pkg from "pg";
export const pool = new pkg.Pool({
  connectionString: process.env.DATABASE_URL,
});

