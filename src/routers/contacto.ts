// src/routers/contacto.ts
import { FastifyInstance } from "fastify";
import { getDb } from "../db";
import { sendContactoEmails } from "../services/mailer";

type ContactoBody = {
  nombre_razon_social?: string | null;
  correo?: string | null;
  telefono?: string | null;

  region_id?: number | null;
  provincia_id?: number | null;
  comuna_id?: number | null;

  tipo_cliente_id?: number | null;
  cantidad_vehiculos?: number | null;

  tipo_vehiculo_id?: number | null;
  objetivo_rastreo_id?: number | null;
  usa_gps_id?: number | null;
  plazo_implementacion_id?: number | null;

  detalle_requerimiento?: string | null;
  acepta_contacto?: boolean | number | string | null;

  // 👇 llegan desde el frontend para el correo (no van a la BD)
  region_nombre?: string | null;
  provincia_nombre?: string | null;
  comuna_nombre?: string | null;
  tipo_cliente_nombre?: string | null;
  tipo_vehiculo_nombre?: string | null;
  objetivo_nombre?: string | null;
  usa_gps_nombre?: string | null;
  plazo_nombre?: string | null;
};

const isTruthy = (v: any) => v === true || v === 1 || v === "1" || v === "true";

export default async function contactoRouter(app: FastifyInstance) {
  app.post("/", async (req: any, reply: any) => {
    const body: ContactoBody = (req.body ?? {}) as ContactoBody;

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

      region_nombre,
      provincia_nombre,
      comuna_nombre,
      tipo_cliente_nombre,
      tipo_vehiculo_nombre,
      objetivo_nombre,
      usa_gps_nombre,
      plazo_nombre,
    } = body;

    // ✅ Normalizamos el checkbox (porque a veces llega "true" / 1 / "1")
    const acepta = isTruthy(acepta_contacto);

    // Validación mínima: checkbox obligatorio
    if (!acepta) {
      return reply.status(400).send({
        ok: false,
        error: "Debes aceptar ser contactado para enviar el formulario.",
      });
    }

    try {
      const db = getDb();

      // 1) Guardar en BD (solo IDs + campos base)
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
          acepta ? 1 : 0,
        ]
      );

      // 2) Enviar correo (con nombres). Si falla, NO rompas el flujo.
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
          acepta_contacto: acepta,

          // nombres “humanos”
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
        app.log.error({ mailErr }, "MAIL ERROR (no rompe flujo)");
      }

      return reply.send({ ok: true, message: "Solicitud enviada correctamente." });
    } catch (err: any) {
      app.log.error({ err }, "CONTACTO ERROR");

      const errno = err?.errno;
      const msg = err?.sqlMessage || err?.message;

      // Triggers / SIGNAL SQLSTATE
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
