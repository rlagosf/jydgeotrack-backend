import { FastifyInstance } from "fastify";
import { pool } from "../db";

export default async function catalogosRouter(app: FastifyInstance) {
  // Regiones
  app.get("/regiones", async () => {
    const [rows] = await pool.query(
      "SELECT id, nombre FROM catalogo_regiones ORDER BY nombre ASC"
    );
    return rows;
  });

  // Provincias por región
  app.get("/provincias/:regionId", async (req: any) => {
    const { regionId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT id, nombre
      FROM catalogo_provincias
      WHERE region_id = ?
      ORDER BY nombre ASC
      `,
      [regionId]
    );

    return rows;
  });

  // Comunas por provincia
  app.get("/comunas/:provinciaId", async (req: any) => {
    const { provinciaId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT id, nombre
      FROM catalogo_comunas
      WHERE provincia_id = ?
      ORDER BY nombre ASC
      `,
      [provinciaId]
    );

    return rows;
  });

  // Tipo de cliente
  app.get("/tipo-cliente", async () => {
    const [rows] = await pool.query(
      `SELECT id, descripcion FROM catalogo_tipo_cliente ORDER BY descripcion ASC`
    );
    return rows;
  });

  // Tipo de vehículo
  app.get("/tipo-vehiculo", async () => {
    const [rows] = await pool.query(
      `SELECT id, descripcion FROM catalogo_tipo_vehiculo ORDER BY descripcion ASC`
    );
    return rows;
  });

  // Objetivo principal del rastreo
  app.get("/objetivo-rastreo", async () => {
    const [rows] = await pool.query(
      `SELECT id, descripcion FROM catalogo_objetivo_rastreo ORDER BY descripcion ASC`
    );
    return rows;
  });

  // ¿Actualmente usa GPS?
  app.get("/usa-gps", async () => {
    const [rows] = await pool.query(
      `SELECT id, descripcion FROM catalogo_usa_gps ORDER BY id ASC`
    );
    return rows;
  });

  // Plazo de implementación
  app.get("/plazo-implementacion", async () => {
    const [rows] = await pool.query(
      `SELECT id, descripcion FROM catalogo_plazo_implementacion ORDER BY id ASC`
    );
    return rows;
  });
}
