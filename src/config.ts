// src/config.ts
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const NODE_ENV = (process.env.NODE_ENV || "development").trim();
const envFile = NODE_ENV === "production" ? ".env.production" : ".env.development";

// Intento A: desde el directorio actual (cPanel a veces lo cambia)
const cwdPath = path.resolve(process.cwd(), envFile);
// Intento B: relativo a dist/ -> sube un nivel al root del proyecto
const distRootPath = path.resolve(__dirname, "..", envFile);

let loadedFrom = "process.env (sin archivo)";

if (fs.existsSync(cwdPath)) {
  dotenv.config({ path: cwdPath });
  loadedFrom = cwdPath;
} else if (fs.existsSync(distRootPath)) {
  dotenv.config({ path: distRootPath });
  loadedFrom = distRootPath;
} else {
  // No reviento aquí: puede que el hosting entregue variables por panel.
  // Pero lo dejamos logueado para diagnóstico.
  console.warn(`[CONFIG] No se encontró ${envFile} en:`, { cwdPath, distRootPath });
}

const must = (k: string) => {
  const v = (process.env[k] ?? "").trim();
  if (!v) {
    console.error(`[CONFIG] Falta ${k}.`, {
      NODE_ENV,
      envFile,
      loadedFrom,
      cwd: process.cwd(),
      dirname: __dirname,
    });
    throw new Error(`Falta ${k} en ${envFile} (o variables de entorno del hosting).`);
  }
  return v;
};

export const CONFIG = {
  NODE_ENV,
  ENV_FILE: envFile,
  ENV_LOADED_FROM: loadedFrom,

  // OJO hosting: a veces el panel define el puerto, o lo inyecta como PORT
  PORT: Number(process.env.PORT || 4001),

  CORS_ORIGIN: (process.env.CORS_ORIGIN || "").trim(),

  DATABASE_URL: must("DATABASE_URL"),

  MAIL: {
    HOST: must("MAIL_HOST"),
    PORT: Number(process.env.MAIL_PORT || 587),
    SECURE: String(process.env.MAIL_SECURE || "").toLowerCase() === "true",
    USER: must("MAIL_USER"),
    PASS: must("MAIL_PASS"),
    FROM: (process.env.MAIL_FROM || "").trim() || must("MAIL_USER"),
    TO: (process.env.MAIL_TO || "").trim(), // interno opcional
  },
};
