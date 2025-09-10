import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT), 
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
