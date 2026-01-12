// src/config.ts
import dotenv from "dotenv";
import path from "path";

// En ts compilado a CommonJS, __dirname EXISTE
const NODE_ENV = (process.env.NODE_ENV || "development").trim();
const envFile = NODE_ENV === "production" ? ".env.production" : ".env.development";

// 📍 Busca el env en la raíz del proyecto
// src/config.ts   -> ../.env.production
// dist/config.js  -> ../.env.production
const envPath = path.resolve(__dirname, "..", envFile);

dotenv.config({ path: envPath });

// Helper: variables obligatorias
const must = (k: string) => {
  const v = String(process.env[k] ?? "").trim();
  if (!v) {
    console.error("❌ ENV PATH USADO:", envPath);
    throw new Error(`Falta ${k} en el ${envFile}`);
  }
  return v;
};

export const CONFIG = {
  NODE_ENV,
  PORT: Number(process.env.PORT || 4001),

  CORS_ORIGIN: String(process.env.CORS_ORIGIN || "").trim(),

  DATABASE_URL: must("DATABASE_URL"),

  MAIL: {
    HOST: must("MAIL_HOST"),
    PORT: Number(process.env.MAIL_PORT || 587),
    SECURE: String(process.env.MAIL_SECURE || "").toLowerCase() === "true",
    USER: must("MAIL_USER"),
    PASS: must("MAIL_PASS"),
    FROM: String(process.env.MAIL_FROM || "").trim() || must("MAIL_USER"),

    // 👇 correo interno
    TO: String(process.env.MAIL_TO || "").trim(),
  },
};
