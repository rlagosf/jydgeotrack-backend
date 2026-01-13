// src/db.ts
import mysql from "mysql2/promise";
import { CONFIG } from "./config";

let pool: mysql.Pool | null = null;
let initializing: Promise<mysql.Pool> | null = null;

// Compatibilidad: módulos antiguos pueden importar { db }
export let db: mysql.Pool;

export async function initDb(): Promise<mysql.Pool> {
  if (pool) return pool;
  if (initializing) return initializing;

  initializing = (async () => {
    try {
      const newPool = mysql.createPool({
        uri: CONFIG.DATABASE_URL,
        waitForConnections: true,
        // hosting-friendly
        connectionLimit: 4,
        queueLimit: 50,
      });

      const conn = await newPool.getConnection();
      await conn.ping();

      try {
        const [[{ db: currentDb }]]: any = await conn.query("SELECT DATABASE() AS db");
        console.log(`🟢 Conectado correctamente a la base de datos: ${currentDb}`);
      } catch {
        console.log("⚠️ No se pudo identificar la base activa (DATABASE()).");
      }

      conn.release();

      pool = newPool;
      db = newPool; // alias compat
      console.log("✅ Pool MySQL inicializado correctamente");

      return newPool;
    } catch (error) {
      console.error("❌ Error al conectar a la base de datos:", error);
      pool = null;
      initializing = null;
      throw error;
    } finally {
      initializing = null;
    }
  })();

  return initializing;
}

export function getDb(): mysql.Pool {
  if (!pool) {
    throw new Error("BD no inicializada. Llama a await initDb() antes de usarla.");
  }
  return pool;
}
