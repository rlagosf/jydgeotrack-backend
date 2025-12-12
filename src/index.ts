import Fastify from "fastify";
import cors from "@fastify/cors";
import { CONFIG } from "./config";
import { testDBConnection } from "./db";
import { registerRoutes } from "./routes";

const app = Fastify({ logger: true });

async function start() {
  await testDBConnection(); // Verifica BD al iniciar

  await app.register(cors, { origin: "*" });

  registerRoutes(app); // Rutas centralizadas

  app.listen({ port: CONFIG.PORT, host: "0.0.0.0" })
    .then(() => console.log(`🚀 Server running on port ${CONFIG.PORT}`))
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });
}

start();
