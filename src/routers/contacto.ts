import { FastifyInstance } from "fastify";
import { pool } from "../db";

export default async function contactoRouter(app: FastifyInstance) {
  app.post("/", async (req: any, reply: any) => {
    const {
      nombre_razon_social,
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
      plazo_implementacion_id,

      detalle_requerimiento,
      acepta_contacto,
    } = req.body ?? {};

    // Validación mínima alineada a tu regla:
    // Para enviar el formulario, debe aceptar contacto (1)
    if (!acepta_contacto) {
      return reply.status(400).send({
        ok: false,
        error: "Debes aceptar ser contactado para enviar el formulario.",
      });
    }

    try {
      await pool.query(
        `
        INSERT INTO contacto_solicitudes (
          nombre_razon_social,
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
          plazo_implementacion_id,

          detalle_requerimiento,
          acepta_contacto
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          nombre_razon_social ?? null,
          correo ?? null,
          telefono ?? null,

          region_id ?? null,
          ciudad_id ?? null,
          comuna_id ?? null,

          tipo_cliente_id ?? null,
          cantidad_vehiculos ?? null,

          tipo_vehiculo_id ?? null,
          objetivo_rastreo_id ?? null,
          usa_gps_id ?? null,
          plazo_implementacion_id ?? null,

          detalle_requerimiento ?? null,
          acepta_contacto ? 1 : 0,
        ]
      );

      return reply.send({ ok: true, message: "Solicitud enviada correctamente." });
    } catch (err: any) {
      console.error(err);

      // Si falla por triggers (SQLSTATE '45000') u otras validaciones DB,
      // normalmente MySQL tira ER_SIGNAL_EXCEPTION o errno 1644
      const errno = err?.errno;
      const msg = err?.sqlMessage || err?.message;

      if (errno === 1644) {
        return reply.status(400).send({
          ok: false,
          error: msg || "Validación de datos falló.",
        });
      }

      return reply.status(500).send({
        ok: false,
        error: "Error al guardar la solicitud.",
      });
    }
  });
}
