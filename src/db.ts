import mysql from "mysql2/promise";
import "dotenv/config";

function parseDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace("/", ""),
  };
}

const DATABASE_URL = process.env.DATABASE_URL || "";
if (!DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en el .env");
}

const cfg = parseDatabaseUrl(DATABASE_URL);

export const pool = mysql.createPool({
  host: cfg.host,
  port: cfg.port,
  user: cfg.user,
  password: cfg.password,
  database: cfg.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testDBConnection() {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    console.log("✅ Conexión a la base de datos OK:", (rows as any)[0].result);
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
    throw error;
  }
}
