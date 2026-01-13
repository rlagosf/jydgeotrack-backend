// src/routers/contacto.ts
import { FastifyInstance } from "fastify";
import { getDb } from "../db";
import { sendContactoEmails } from "../services/mailer";

export default async function contactoRouter(app: FastifyInstance) {
  app.post("/", async (req: any, reply: any) => {
    const body = req.body ?? {};

    const {
      nombre_razon_social,
      correo,
      telefono,

      region_id,
      provincia_id,
      comuna_id,

      tipo_cliente_id,
      cantidad_vehiculos,

      tipo_vehiculo_id,
      objetivo_rastreo_id,
      usa_gps_id,
      plazo_implementacion_id,

      detalle_requerimiento,
      acepta_contacto,

      // nombres “humanos” para el correo (no van a BD)
      region_nombre,
      provincia_nombre,
      comuna_nombre,
      tipo_cliente_nombre,
      tipo_vehiculo_nombre,
      objetivo_nombre,
      usa_gps_nombre,
      plazo_nombre,
    } = body;

    if (!acepta_contacto) {
      return reply.status(400).send({
        ok: false,
        error: "Debes aceptar ser contactado para enviar el formulario.",
      });
    }

    try {
      const db = getDb();

      await db.query(
        `
        INSERT INTO contacto_solicitudes (
          nombre_razon_social,
          correo,
          telefono,

          region_id,
          provincia_id,
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
          provincia_id ?? null,
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

      // Mail: no rompe flujo si falla
      try {
        await sendContactoEmails({
          nombre_razon_social,
          correo,
          telefono,

          region_id,
          provincia_id,
          comuna_id,

          tipo_cliente_id,
          cantidad_vehiculos,

          tipo_vehiculo_id,
          objetivo_rastreo_id,
          usa_gps_id,
          plazo_implementacion_id,

          detalle_requerimiento,
          acepta_contacto,

          region_nombre,
          provincia_nombre,
          comuna_nombre,
          tipo_cliente_nombre,
          tipo_vehiculo_nombre,
          objetivo_nombre,
          usa_gps_nombre,
          plazo_nombre,
        });
      } catch (mailErr) {
        app.log.error({ mailErr }, "MAIL ERROR");
      }

      return reply.send({ ok: true, message: "Solicitud enviada correctamente." });
    } catch (err: any) {
      app.log.error({ err }, "CONTACTO INSERT ERROR");

      const errno = err?.errno;
      const msg = err?.sqlMessage || err?.message;

      // Trigger / SIGNAL SQLSTATE
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
