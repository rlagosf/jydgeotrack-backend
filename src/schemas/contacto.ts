// src/routers/contacto.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { pool } from "../db";
import { sendContactoEmails } from "../services/mailer";


type ContactoBody = {
  nombre_razon_social?: string;
  correo?: string;
  telefono?: string;

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
  acepta_contacto?: boolean | number;

  // 👇 llegan desde el frontend solo para correo
  region_nombre?: string;
  provincia_nombre?: string;
  comuna_nombre?: string;

  tipo_cliente_nombre?: string;
  tipo_vehiculo_nombre?: string;
  objetivo_nombre?: string;
  usa_gps_nombre?: string;
  plazo_nombre?: string;
};

function toNullNumber(v: any): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toNullText(v: any): string | null {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function isTruthy(v: any): boolean {
  // acepta true/1/"1"/"true"
  return v === true || v === 1 || v === "1" || v === "true";
}

function validateEmail(email: string): boolean {
  // simple y suficiente para formulario
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(body: ContactoBody): string | null {
  const nombre = String(body.nombre_razon_social ?? "").trim();
  const correo = String(body.correo ?? "").trim();
  const telefono = String(body.telefono ?? "").trim();

  if (!nombre) return "Ingresa tu nombre o razón social.";
  if (!correo) return "Ingresa un correo.";
  if (!validateEmail(correo)) return "El correo no tiene un formato válido.";
  if (!telefono) return "Ingresa un teléfono / WhatsApp.";

  if (!isTruthy(body.acepta_contacto)) {
    return "Debes aceptar ser contactado para enviar el formulario.";
  }

  // reglas negocio mínimas (si aplican)
  const tipoCliente = toNullNumber(body.tipo_cliente_id);
  if (!tipoCliente) return "Selecciona un tipo de cliente.";

  const cant = toNullNumber(body.cantidad_vehiculos);
  if (!cant || cant < 1) return "La cantidad de vehículos debe ser 1 o más.";

  return null;
}

export default async function contactoRouter(app: FastifyInstance) {
  app.post(
    "/",
    async (
      req: FastifyRequest<{ Body: ContactoBody }>,
      reply: FastifyReply
    ) => {
      const body = req.body ?? {};

      // -------- Validación --------
      const err = validate(body);
      if (err) return reply.status(400).send({ ok: false, error: err });

      // -------- Normalización --------
      const payloadDb = {
        nombre_razon_social: toNullText(body.nombre_razon_social),
        correo: toNullText(body.correo),
        telefono: toNullText(body.telefono),

        region_id: toNullNumber(body.region_id),
        provincia_id: toNullNumber(body.provincia_id),
        comuna_id: toNullNumber(body.comuna_id),

        tipo_cliente_id: toNullNumber(body.tipo_cliente_id),
        cantidad_vehiculos: toNullNumber(body.cantidad_vehiculos),

        tipo_vehiculo_id: toNullNumber(body.tipo_vehiculo_id),
        objetivo_rastreo_id: toNullNumber(body.objetivo_rastreo_id),
        usa_gps_id: toNullNumber(body.usa_gps_id),
        plazo_implementacion_id: toNullNumber(body.plazo_implementacion_id),

        detalle_requerimiento: toNullText(body.detalle_requerimiento),
        acepta_contacto: isTruthy(body.acepta_contacto) ? 1 : 0,
      };

      try {
        // 1) Guardar en BD (solo IDs + campos base)
        await pool.query(
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
            payloadDb.nombre_razon_social,
            payloadDb.correo,
            payloadDb.telefono,

            payloadDb.region_id,
            payloadDb.provincia_id,
            payloadDb.comuna_id,

            payloadDb.tipo_cliente_id,
            payloadDb.cantidad_vehiculos,

            payloadDb.tipo_vehiculo_id,
            payloadDb.objetivo_rastreo_id,
            payloadDb.usa_gps_id,
            payloadDb.plazo_implementacion_id,

            payloadDb.detalle_requerimiento,
            payloadDb.acepta_contacto,
          ]
        );

        // 2) Enviar correo (con nombres). Si falla, NO rompas el flujo.
        try {
          const info = await sendContactoEmails({
            ...payloadDb,
            region_nombre: toNullText(body.region_nombre),
            provincia_nombre: toNullText(body.provincia_nombre),
            comuna_nombre: toNullText(body.comuna_nombre),
            tipo_cliente_nombre: toNullText(body.tipo_cliente_nombre),
            tipo_vehiculo_nombre: toNullText(body.tipo_vehiculo_nombre),
            objetivo_nombre: toNullText(body.objetivo_nombre),
            usa_gps_nombre: toNullText(body.usa_gps_nombre),
            plazo_nombre: toNullText(body.plazo_nombre),
          });

          app.log.info({ info }, "MAIL RESULT (internal + client)");
        } catch (mailErr) {
          app.log.error({ err: mailErr }, "MAIL ERROR (this should not be silent)");
        }


        return reply.send({
          ok: true,
          message: "✅ Solicitud enviada correctamente.",
        });
      } catch (e: any) {
        app.log.error({ err: e }, "DB ERROR: contacto_solicitudes insert");

        const errno = e?.errno;
        const msg = e?.sqlMessage || e?.message;

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
    }
  );
}
