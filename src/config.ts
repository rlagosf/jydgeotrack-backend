// src/config.ts
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const isProd = process.env.NODE_ENV === "production";
const envFile = isProd ? ".env.production" : ".env.development";

/**
 * Hosting reality-check:
 * - cPanel puede cambiar cwd
 * - dist puede quedar en otro lado
 * Estrategia: probamos 2 rutas, si no existe no reventamos (hosting puede inyectar vars).
 */
const cwdPath = path.resolve(process.cwd(), envFile);
const distRootPath = path.resolve(__dirname, "..", envFile);

let loadedFrom = "process.env (sin archivo)";

if (fs.existsSync(cwdPath)) {
  dotenv.config({ path: cwdPath });
  loadedFrom = cwdPath;
  console.log(`🟢 Cargando variables desde ${envFile} (${loadedFrom})`);
} else if (fs.existsSync(distRootPath)) {
  dotenv.config({ path: distRootPath });
  loadedFrom = distRootPath;
  console.log(`🟢 Cargando variables desde ${envFile} (${loadedFrom})`);
} else {
  console.warn(`⚠️ No se encontró ${envFile}. Usando process.env del hosting.`, {
    cwdPath,
    distRootPath,
    cwd: process.cwd(),
    dirname: __dirname,
  });
}

// Helper para variables obligatorias
const must = (key: string, fallback?: string) => {
  const raw = (process.env[key] ?? fallback ?? "").toString().trim();
  if (!raw) {
    throw new Error(`Falta variable de entorno: ${key}`);
  }
  return raw;
};

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  ENV_FILE: envFile,
  ENV_LOADED_FROM: loadedFrom,

  PORT: Number.isFinite(Number(process.env.PORT))
    ? Number(process.env.PORT)
    : 8000,

  // En prod exigimos CORS_ORIGIN, en dev damos default
  CORS_ORIGIN: isProd ? must("CORS_ORIGIN") : process.env.CORS_ORIGIN ?? "http://localhost:5173",

  // En prod exigimos, en dev damos default de ejemplo
  DATABASE_URL: must(
    "DATABASE_URL",
    isProd ? undefined : "mysql://root:password@localhost:3306/app_db"
  ),

  // Mail: en el proyecto RAFC esto no existía por defecto,
  // pero en tu caso (GeoTrack) sí es core. Lo mantenemos.
  MAIL: {
    HOST: must("MAIL_HOST"),
    PORT: Number(process.env.MAIL_PORT ?? "587"),
    SECURE: String(process.env.MAIL_SECURE ?? "").toLowerCase() === "true",
    USER: must("MAIL_USER"),
    PASS: must("MAIL_PASS"),
    FROM: (process.env.MAIL_FROM ?? "").trim() || must("MAIL_USER"),
    TO: (process.env.MAIL_TO ?? "").trim(), // opcional interno
  },
};
