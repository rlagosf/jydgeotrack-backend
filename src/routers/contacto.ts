import { FastifyInstance } from "fastify";
import { pool } from "../db";

export default async function contactoRouter(app: FastifyInstance) {
  app.post("/", async (req: any, reply: any) => {
    const {
      nombre,            // frontend
      correo,
      telefono,
      region_id,
      ciudad_id,
      comuna_id,
      tipo_cliente_id,
      cantidad_vehiculos,
      tipo_vehiculo_id,
      objetivo_rastreo_id,
      usa_gps_id,
      plazo_id,
      detalle,
      acepta_contacto
    } = req.body;

    try {
      await pool.query(
        `INSERT INTO formularios_contacto 
          (nombre_razon_social, correo_electronico, telefono_whatsapp,
           id_region, id_ciudad, id_comuna,
           id_tipo_cliente, cantidad_vehiculos,
           id_tipo_vehiculo, id_objetivo_rastreo, id_uso_gps, id_plazo_implementacion,
           detalle_requerimiento, acepta_contacto)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre ?? null,
          correo ?? null,
          telefono ?? null,
          region_id ?? null,
          ciudad_id ?? null,
          comuna_id ?? null,
          tipo_cliente_id,
          cantidad_vehiculos,
          tipo_vehiculo_id ?? null,
          objetivo_rastreo_id ?? null,
          usa_gps_id ?? null,
          plazo_id ?? null,
          detalle ?? null,
          acepta_contacto ? 1 : 0
        ]
      );

      return reply.send({ ok: true, message: "Solicitud enviada correctamente." });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ ok: false, error: "Error al guardar la solicitud." });
    }
  });
}
