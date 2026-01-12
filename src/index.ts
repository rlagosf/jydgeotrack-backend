import Fastify from "fastify";
import cors from "@fastify/cors";
import { CONFIG } from "./config";
import { testDBConnection } from "./db";
import { registerRoutes } from "./routes";

const app = Fastify({ logger: true });

async function start() {
  await testDBConnection();

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
  app.log.info(`🚀 Server running on port ${CONFIG.PORT}`);
}

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
