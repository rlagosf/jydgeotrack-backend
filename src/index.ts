// src/index.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { CONFIG } from "./config";
import { testDBConnection } from "./db";
import { registerRoutes } from "./routes";

const app = Fastify({ logger: true });

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] unhandledRejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[FATAL] uncaughtException:", err);
  process.exit(1);
});

async function start() {
  app.log.info("[BOOT] Starting JD GeoTrack backend...");

  // ✅ OBJETO PRIMERO, MENSAJE DESPUÉS (evita el error TS2769)
  app.log.info(
    {
      NODE_ENV: CONFIG.NODE_ENV,
      ENV_FILE: CONFIG.ENV_FILE,
      ENV_LOADED_FROM: CONFIG.ENV_LOADED_FROM,
      PORT: CONFIG.PORT,
      CORS_ORIGIN: CONFIG.CORS_ORIGIN,

      MAIL_HOST: CONFIG.MAIL.HOST,
      MAIL_PORT: CONFIG.MAIL.PORT,
      MAIL_USER: CONFIG.MAIL.USER ? "***set***" : "***missing***",

      DB_URL_SET: CONFIG.DATABASE_URL ? "***set***" : "***missing***",
    },
    "[BOOT] ENV"
  );

  // Health
  app.get("/api/health", async () => {
    return {
      ok: true,
      env: CONFIG.NODE_ENV,
      loadedFrom: CONFIG.ENV_LOADED_FROM,
      time: new Date().toISOString(),
    };
  });

  // DB check (si falla, queda en log)
  await testDBConnection();

  // CORS
  const isProd = CONFIG.NODE_ENV === "production";
  const allowlist = CONFIG.CORS_ORIGIN
    ? CONFIG.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  await app.register(cors, {
    origin: isProd
      ? (origin, cb) => {
          if (!origin) return cb(null, true);
          cb(null, allowlist.includes(origin));
        }
      : true,
    credentials: true,
  });

  registerRoutes(app);

  await app.listen({ port: CONFIG.PORT, host: "0.0.0.0" });
  app.log.info(`🚀 Server running on 0.0.0.0:${CONFIG.PORT}`);
}

start().catch((err) => {
  app.log.error({ err }, "[BOOT] Failed to start");
  process.exit(1);
});
