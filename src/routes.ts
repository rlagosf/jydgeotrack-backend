import { FastifyInstance } from "fastify";
import catalogosRouter from "./routers/catalogos";
import contactoRouter from "./routers/contacto";

export function registerRoutes(app: FastifyInstance) {
  app.register(catalogosRouter, { prefix: "/api/catalogos" });
  app.register(contactoRouter, { prefix: "/api/contacto" });
}
