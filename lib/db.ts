// lib/db.ts

import mysql from "mysql2/promise";

// Membuat koneksi pool ke database.
// Pool lebih efisien daripada membuat koneksi baru setiap kali ada query.
// Konfigurasi diambil dari environment variables yang ada di .env.local
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


export default pool;