// src/routes.ts
import { FastifyInstance } from "fastify";

// Routers
import catalogosRouter from "./routers/catalogos";
import contactoRouter from "./routers/contacto";

export async function registerRoutes(app: FastifyInstance) {
  const API_BASE = "/api";

  app.register(catalogosRouter, { prefix: `${API_BASE}/catalogos` });
  app.register(contactoRouter, { prefix: `${API_BASE}/contacto` });
}
