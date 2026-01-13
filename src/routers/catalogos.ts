// src/routers/catalogos.ts
import { FastifyInstance } from "fastify";
import { getDb } from "../db";

type IdParams = {
  regionId?: string;
  provinciaId?: string;
};

export default async function catalogosRouter(app: FastifyInstance) {
  // Helper local para evitar repetir boilerplate
  const safeQuery = async (sql: string, params: any[] = []) => {
    const db = getDb();
    const [rows] = await db.query(sql, params);
    return rows;
  };

  /* ───────────── Regiones ───────────── */
  app.get("/regiones", async (_req, reply) => {
    try {
      const rows = await safeQuery(
        "SELECT id, nombre FROM catalogo_regiones ORDER BY nombre ASC"
      );
      return rows;
    } catch (err) {
      app.log.error({ err }, "CATALOGOS /regiones");
      return reply.status(500).send({ ok: false, error: "Error al obtener regiones" });
    }
  });

  /* ───────────── Provincias ───────────── */
  app.get("/provincias/:regionId", async (req: any, reply) => {
    try {
      const { regionId } = req.params as IdParams;

      if (!regionId || isNaN(Number(regionId))) {
        return reply.status(400).send({ ok: false, error: "regionId inválido" });
      }

      const rows = await safeQuery(
        `
        SELECT id, nombre
        FROM catalogo_provincias
        WHERE region_id = ?
        ORDER BY nombre ASC
        `,
        [Number(regionId)]
      );

      return rows;
    } catch (err) {
      app.log.error({ err }, "CATALOGOS /provincias");
      return reply.status(500).send({ ok: false, error: "Error al obtener provincias" });
    }
  });

  /* ───────────── Comunas ───────────── */
  app.get("/comunas/:provinciaId", async (req: any, reply) => {
    try {
      const { provinciaId } = req.params as IdParams;

      if (!provinciaId || isNaN(Number(provinciaId))) {
        return reply.status(400).send({ ok: false, error: "provinciaId inválido" });
      }

      const rows = await safeQuery(
        `
        SELECT id, nombre
        FROM catalogo_comunas
        WHERE provincia_id = ?
        ORDER BY nombre ASC
        `,
        [Number(provinciaId)]
      );

      return rows;
    } catch (err) {
      app.log.error({ err }, "CATALOGOS /comunas");
      return reply.status(500).send({ ok: false, error: "Error al obtener comunas" });
    }
  });

  /* ───────────── Tipo cliente ───────────── */
  app.get("/tipo-cliente", async (_req, reply) => {
    try {
      const rows = await safeQuery(
        "SELECT id, descripcion FROM catalogo_tipo_cliente ORDER BY descripcion ASC"
      );
      return rows;
    } catch (err) {
      app.log.error({ err }, "CATALOGOS /tipo-cliente");
      return reply.status(500).send({ ok: false, error: "Error al obtener tipo cliente" });
    }
  });

  /* ───────────── Tipo vehículo ───────────── */
  app.get("/tipo-vehiculo", async (_req, reply) => {
    try {
      const rows = await safeQuery(
        "SELECT id, descripcion FROM catalogo_tipo_vehiculo ORDER BY descripcion ASC"
      );
      return rows;
    } catch (err) {
      app.log.error({ err }, "CATALOGOS /tipo-vehiculo");
      return reply.status(500).send({ ok: false, error: "Error al obtener tipo vehículo" });
    }
  });

  /* ───────────── Objetivo rastreo ───────────── */
  app.get("/objetivo-rastreo", async (_req, reply) => {
    try {
      const rows = await safeQuery(
        "SELECT id, descripcion FROM catalogo_objetivo_rastreo ORDER BY descripcion ASC"
      );
      return rows;
    } catch (err) {
      app.log.error({ err }, "CATALOGOS /objetivo-rastreo");
      return reply
        .status(500)
        .send({ ok: false, error: "Error al obtener objetivos de rastreo" });
    }
  });

  /* ───────────── Usa GPS ───────────── */
  app.get("/usa-gps", async (_req, reply) => {
    try {
      const rows = await safeQuery(
        "SELECT id, descripcion FROM catalogo_usa_gps ORDER BY id ASC"
      );
      return rows;
    } catch (err) {
      app.log.error({ err }, "CATALOGOS /usa-gps");
      return reply.status(500).send({ ok: false, error: "Error al obtener usa GPS" });
    }
  });

  /* ───────────── Plazo implementación ───────────── */
  app.get("/plazo-implementacion", async (_req, reply) => {
    try {
      const rows = await safeQuery(
        "SELECT id, descripcion FROM catalogo_plazo_implementacion ORDER BY id ASC"
      );
      return rows;
    } catch (err) {
      app.log.error({ err }, "CATALOGOS /plazo-implementacion");
      return reply
        .status(500)
        .send({ ok: false, error: "Error al obtener plazos de implementación" });
    }
  });
}
