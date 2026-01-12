import dotenv from "dotenv";
import path from "path";

// 1) Decide entorno (por defecto development)
const NODE_ENV = (process.env.NODE_ENV || "development").trim();

// 2) Carga el archivo correcto
const envFile = NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Helper
const must = (k: string) => {
  const v = (process.env[k] ?? "").trim();
  if (!v) throw new Error(`Falta ${k} en el ${envFile}`);
  return v;
};

export const CONFIG = {
  NODE_ENV,
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
    TO_TEAM: (process.env.MAIL_TO_TEAM || "").trim(), // opcional
  },
};
