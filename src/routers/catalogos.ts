import { FastifyInstance } from "fastify";
import { pool } from "../db";

export default async function catalogosRouter(app: FastifyInstance) {
  app.get("/regiones", async () => {
    const [rows] = await pool.query(
      "SELECT id_region AS id, nombre FROM regiones ORDER BY nombre ASC"
    );
    return rows;
  });

  app.get("/ciudades/:regionId", async (req: any) => {
    const { regionId } = req.params;
    const [rows] = await pool.query(
      "SELECT id_ciudad AS id, nombre FROM ciudades WHERE id_region = ? ORDER BY nombre ASC",
      [regionId]
    );
    return rows;
  });

  app.get("/comunas/:ciudadId", async (req: any) => {
    const { ciudadId } = req.params;
    const [rows] = await pool.query(
      "SELECT id_comuna AS id, nombre FROM comunas WHERE id_ciudad = ? ORDER BY nombre ASC",
      [ciudadId]
    );
    return rows;
  });

  app.get("/tipo-cliente", async () => {
    const [rows] = await pool.query(
      "SELECT id_tipo_cliente AS id, nombre FROM tipos_cliente ORDER BY nombre ASC"
    );
    return rows;
  });

  app.get("/tipo-vehiculo", async () => {
    const [rows] = await pool.query(
      "SELECT id_tipo_vehiculo AS id, nombre FROM tipos_vehiculo ORDER BY nombre ASC"
    );
    return rows;
  });

  app.get("/objetivo-rastreo", async () => {
    const [rows] = await pool.query(
      "SELECT id_objetivo AS id, nombre FROM objetivos_rastreo ORDER BY nombre ASC"
    );
    return rows;
  });

  app.get("/usa-gps", async () => {
    const [rows] = await pool.query(
      "SELECT id_uso_gps AS id, nombre FROM estados_uso_gps ORDER BY id_uso_gps ASC"
    );
    return rows;
  });

  app.get("/plazo-implementacion", async () => {
    const [rows] = await pool.query(
      "SELECT id_plazo AS id, nombre FROM plazos_implementacion ORDER BY id_plazo ASC"
    );
    return rows;
  });
}
