// src/index.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "jsonwebtoken";

import { CONFIG } from "./config";
import { initDb, getDb } from "./db";
import { registerRoutes } from "./routes";

const app = Fastify({
  logger: CONFIG.NODE_ENV === "production" ? { level: "warn" } : { level: "info" },
});

async function bootstrap() {
  // CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Helmet (igual que tu RAFC)
  await app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'none'"],
        "base-uri": ["'none'"],
        "form-action": ["'none'"],
        "frame-ancestors": ["'none'"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
      },
    },
    frameguard: { action: "deny" },
    hsts:
      CONFIG.NODE_ENV === "production"
        ? { maxAge: 15552000, includeSubDomains: true, preload: false }
        : false,
    noSniff: true,
    referrerPolicy: { policy: "no-referrer" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
  });

  app.addHook("onSend", async (_req, reply, payload) => {
    reply.header(
      "Permissions-Policy",
      "geolocation=(), camera=(), microphone=(), payment=(), usb=(), fullscreen=(self)"
    );
    reply.header("X-DNS-Prefetch-Control", "off");
    reply.header("X-Permitted-Cross-Domain-Policies", "none");
    return payload;
  });

  // Home/Health (HTML + JSON como RAFC)
  const HTML_CT = "text/html; charset=UTF-8";
  const JSON_CT = "application/json; charset=UTF-8";

  const homeHtml = () => `<!doctype html>
  <html><head><meta charset="utf-8"><title>API</title></head>
  <body>
    <h1>Backend API</h1>
    <p>Status: online</p>
    <p>Environment: ${CONFIG.NODE_ENV}</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
  </body></html>`;

  const healthJson = (req: any) => ({
    ok: true,
    env: CONFIG.NODE_ENV,
    path: req.url,
    loadedFrom: CONFIG.ENV_LOADED_FROM,
    time: new Date().toISOString(),
  });

  app.get("/", async (_req, reply) => reply.header("Content-Type", HTML_CT).send(homeHtml()));
  app.get("/api", async (_req, reply) => reply.header("Content-Type", HTML_CT).send(homeHtml()));

  app.get("/health", async (req, reply) =>
    reply.header("Content-Type", JSON_CT).send(healthJson(req))
  );
  app.get("/api/health", async (req, reply) =>
    reply.header("Content-Type", JSON_CT).send(healthJson(req))
  );

  app.get("/favicon.ico", async (_req, reply) => reply.code(204).send());
  app.get("/robots.txt", async (_req, reply) =>
    reply.header("Content-Type", "text/plain; charset=UTF-8").send("User-agent: *\nDisallow:\n")
  );

  // BD
  await initDb();

  // JWT global (opcional). Si tu proyecto nuevo NO usa JWT, se elimina este hook.
  const PUBLIC = [
    /^\/$/i,
    /^\/api\/?$/i,
    /^\/health(?:\/.*)?$/i,
    /^\/api\/health(?:\/.*)?$/i,

    // 🔓 contacto público
    /^\/api\/contacto(?:\/.*)?$/i,

    // 🔓 catálogos públicos (si los necesitas)
    /^\/api\/catalogos(?:\/.*)?$/i,
  ];

  app.addHook("onRequest", async (req, reply) => {
    if (req.method === "OPTIONS" || req.method === "HEAD") return;

    const path = req.url.split("?")[0];
    if (PUBLIC.some((rx) => rx.test(path))) return;

    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return reply.code(401).send({ ok: false, message: "Falta Bearer token" });
    }

    try {
      const token = auth.substring(7);
      const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
      (req as any).user = payload;
    } catch {
      return reply.code(401).send({ ok: false, message: "Token inválido o expirado" });
    }
  });

  // Rutas
  await registerRoutes(app);

  // Shutdown limpio
  const close = async () => {
    app.log.info("Shutting down gracefully...");
    try {
      await app.close();
      try {
        const pool = getDb();
        await pool.end();
        app.log.info("MySQL pool closed");
      } catch (e) {
        app.log.error(e, "Pool close error");
      }
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, "Error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);

  const PORT = Number(process.env.PORT) || CONFIG.PORT || 8000;
  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`🟢 Server ready (env=${CONFIG.NODE_ENV}) — listening on 0.0.0.0:${PORT}`);
}

bootstrap().catch((err) => {
  app.log.error(err, "❌ Fatal error on bootstrap");
  process.exit(1);
});
