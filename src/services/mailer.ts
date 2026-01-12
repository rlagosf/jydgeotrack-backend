// src/services/mailer.ts
import nodemailer from "nodemailer";

export type ContactoEmailPayload = {
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
  acepta_contacto?: boolean | number | null;

  region_nombre?: string | null;
  provincia_nombre?: string | null;
  comuna_nombre?: string | null;

  tipo_cliente_nombre?: string | null;
  tipo_vehiculo_nombre?: string | null;
  objetivo_nombre?: string | null;
  usa_gps_nombre?: string | null;
  plazo_nombre?: string | null;
};

const env = (k: string, fallback = "") => String(process.env[k] ?? fallback).trim();
const toStr = (v: any) => (v == null ? "" : String(v)).trim();
const isTruthy = (v: any) => v === true || v === 1 || v === "1" || v === "true";
const boolToSiNo = (v: any) => (isTruthy(v) ? "Sí" : "No");

const MAIL_HOST = env("MAIL_HOST");
const MAIL_PORT = Number(env("MAIL_PORT", "587"));
const MAIL_USER = env("MAIL_USER");
const MAIL_PASS = env("MAIL_PASS");

// 465 => TLS directo (secure:true) | 587 => STARTTLS (secure:false)
const MAIL_SECURE =
  env("MAIL_SECURE") !== "" ? env("MAIL_SECURE").toLowerCase() === "true" : MAIL_PORT === 465;

const MAIL_FROM = env("MAIL_FROM", MAIL_USER);
const MAIL_TO = env("MAIL_TO"); // interno (equipo)

let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    throw new Error("SMTP misconfigured: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS are required.");
  }

  _transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: MAIL_SECURE,
    auth: { user: MAIL_USER, pass: MAIL_PASS },

    pool: true,
    maxConnections: 2,
    maxMessages: 50,

    connectionTimeout: 12_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,

    tls: {
      // En hosting a veces es necesario ponerlo en false, pero NO lo hagas a ciegas.
      // Déjalo true por defecto.
      rejectUnauthorized: env("MAIL_TLS_REJECT_UNAUTHORIZED", "true").toLowerCase() === "true",
      minVersion: "TLSv1.2",
    },
  });

  return _transporter;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildCommon(p: ContactoEmailPayload) {
  const nombre = toStr(p.nombre_razon_social);
  const correo = toStr(p.correo);
  const telefono = toStr(p.telefono);

  const ubicacion =
    [toStr(p.comuna_nombre), toStr(p.provincia_nombre), toStr(p.region_nombre)]
      .filter(Boolean)
      .join(", ") || "—";

  const detalle = toStr(p.detalle_requerimiento) || "—";

  const negocio = {
    tipoCliente: toStr(p.tipo_cliente_nombre) || "—",
    cantidad: p.cantidad_vehiculos ?? "—",
    tipoVehiculo: toStr(p.tipo_vehiculo_nombre) || "—",
    objetivo: toStr(p.objetivo_nombre) || "—",
    usaGps: toStr(p.usa_gps_nombre) || "—",
    plazo: toStr(p.plazo_nombre) || "—",
    acepta: boolToSiNo(p.acepta_contacto),
  };

  return { nombre, correo, telefono, ubicacion, detalle, negocio };
}

/**
 * ✅ Envía 2 correos:
 * 1) Interno al equipo (MAIL_TO)
 * 2) Confirmación al cliente (p.correo)
 */
export async function sendContactoEmails(p: ContactoEmailPayload) {
  console.log("[MAIL] sendContactoEmails() called");

  const transporter = getTransporter();
  console.log("[MAIL] transporter created", {
    hasFrom: !!MAIL_FROM,
    hasTo: !!MAIL_TO,
    from: MAIL_FROM,
    to: MAIL_TO,
  });

  const { nombre, correo, telefono, ubicacion, detalle, negocio } = buildCommon(p);

  console.log("[MAIL] buildCommon()", {
    nombre,
    correo,
    telefono,
    ubicacion,
    detalleLen: (detalle ?? "").length,
    negocio,
  });

  const tasks: Promise<any>[] = [];
  const meta: Array<{ kind: "internal" | "client"; to: string; subject: string }> = [];

  // 1) Correo interno (equipo)
  if (MAIL_TO) {
    const subject = `Nuevo contacto: ${nombre || "Solicitud"} — JD GeoTrack`;
    console.log("[MAIL] preparing INTERNAL email", { to: MAIL_TO, subject });

    const text = [
      "NUEVA SOLICITUD DE CONTACTO - JD GeoTrack",
      "",
      `Nombre/Razón social: ${nombre || "—"}`,
      `Correo: ${correo || "—"}`,
      `Teléfono: ${telefono || "—"}`,
      `Ubicación: ${ubicacion}`,
      "",
      `Tipo cliente: ${negocio.tipoCliente}`,
      `Cantidad vehículos: ${negocio.cantidad}`,
      `Tipo vehículo: ${negocio.tipoVehiculo}`,
      `Objetivo: ${negocio.objetivo}`,
      `¿Usa GPS?: ${negocio.usaGps}`,
      `Plazo: ${negocio.plazo}`,
      `Acepta contacto: ${negocio.acepta}`,
      "",
      "Detalle:",
      detalle,
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif">
        <h2>JD GeoTrack — Nueva solicitud de contacto</h2>
        <p><b>Nombre/Razón social:</b> ${escapeHtml(nombre || "—")}</p>
        <p><b>Correo:</b> ${escapeHtml(correo || "—")}</p>
        <p><b>Teléfono:</b> ${escapeHtml(telefono || "—")}</p>
        <p><b>Ubicación:</b> ${escapeHtml(ubicacion)}</p>
        <hr/>
        <p><b>Tipo cliente:</b> ${escapeHtml(negocio.tipoCliente)}</p>
        <p><b>Cantidad vehículos:</b> ${escapeHtml(String(negocio.cantidad))}</p>
        <p><b>Tipo vehículo:</b> ${escapeHtml(negocio.tipoVehiculo)}</p>
        <p><b>Objetivo:</b> ${escapeHtml(negocio.objetivo)}</p>
        <p><b>¿Usa GPS?:</b> ${escapeHtml(negocio.usaGps)}</p>
        <p><b>Plazo:</b> ${escapeHtml(negocio.plazo)}</p>
        <p><b>Acepta contacto:</b> ${escapeHtml(negocio.acepta)}</p>
        <hr/>
        <p><b>Detalle:</b></p>
        <pre style="background:#f5f5f5;padding:10px;border-radius:8px;white-space:pre-wrap">${escapeHtml(detalle)}</pre>
      </div>
    `;

    meta.push({ kind: "internal", to: MAIL_TO, subject });

    tasks.push(
      transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        subject,
        text,
        html,
        replyTo: correo || undefined,
      })
    );
  } else {
    console.log("[MAIL] INTERNAL skipped: MAIL_TO is empty");
  }

  // 2) Confirmación al cliente
  const isValidEmail = !!(correo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo));
  console.log("[MAIL] client email validation", { correo, isValidEmail });

  if (isValidEmail) {
    const subject = "Recibimos tu solicitud — JD GeoTrack";
    console.log("[MAIL] preparing CLIENT email", { to: correo, subject });

    const text = [
      `Hola${nombre ? ` ${nombre}` : ""},`,
      "",
      "Recibimos tu solicitud de contacto en JD GeoTrack.",
      "En breve un integrante de nuestro equipo se comunicará contigo.",
      "",
      "Resumen:",
      `- Nombre/Razón social: ${nombre || "—"}`,
      `- Teléfono: ${telefono || "—"}`,
      `- Ubicación: ${ubicacion}`,
      `- Tipo cliente: ${negocio.tipoCliente}`,
      `- Cantidad de vehículos: ${negocio.cantidad}`,
      "",
      "Gracias por contactarnos.",
      "JD GeoTrack",
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif">
        <h2>¡Solicitud recibida!</h2>
        <p>Hola${nombre ? ` <b>${escapeHtml(nombre)}</b>` : ""},</p>
        <p>Recibimos tu solicitud de contacto en <b>JD GeoTrack</b>. En breve un integrante de nuestro equipo se comunicará contigo.</p>
        <hr/>
        <p><b>Resumen:</b></p>
        <ul>
          <li><b>Nombre/Razón social:</b> ${escapeHtml(nombre || "—")}</li>
          <li><b>Teléfono:</b> ${escapeHtml(telefono || "—")}</li>
          <li><b>Ubicación:</b> ${escapeHtml(ubicacion)}</li>
          <li><b>Tipo cliente:</b> ${escapeHtml(negocio.tipoCliente)}</li>
          <li><b>Cantidad de vehículos:</b> ${escapeHtml(String(negocio.cantidad))}</li>
        </ul>
        <p style="margin-top:14px">Gracias por contactarnos.<br/>JD GeoTrack</p>
      </div>
    `;

    meta.push({ kind: "client", to: correo, subject });

    tasks.push(
      transporter.sendMail({
        from: MAIL_FROM,
        to: correo, // ✅ acá va el solicitante
        subject,
        text,
        html,
      })
    );
  } else {
    console.log("[MAIL] CLIENT skipped: invalid or empty correo", { correo });
  }

  console.log("[MAIL] tasks queued", {
    tasksCount: tasks.length,
    queued: meta,
  });

  // Enviar ambos sin romper el flujo si uno falla:
  const results = await Promise.allSettled(tasks);

  console.log("[MAIL] Promise.allSettled() finished", {
    resultsCount: results.length,
    summary: results.map((r, i) => ({
      i,
      kind: meta[i]?.kind,
      to: meta[i]?.to,
      status: r.status,
      // para fulfilled, muestro cosas útiles de nodemailer:
      ...(r.status === "fulfilled"
        ? {
            messageId: (r.value as any)?.messageId,
            accepted: (r.value as any)?.accepted,
            rejected: (r.value as any)?.rejected,
            response: (r.value as any)?.response,
          }
        : {
            reason: (r.reason as any)?.message || r.reason,
          }),
    })),
  });

  // Si alguno falló, gritarlo explícito:
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error("[MAIL] SEND FAILED", {
        kind: meta[i]?.kind,
        to: meta[i]?.to,
        error: r.reason,
        message: (r.reason as any)?.message,
        code: (r.reason as any)?.code,
        command: (r.reason as any)?.command,
        response: (r.reason as any)?.response,
        responseCode: (r.reason as any)?.responseCode,
      });
    } else {
      console.log("[MAIL] SEND OK", {
        kind: meta[i]?.kind,
        to: meta[i]?.to,
        messageId: (r.value as any)?.messageId,
        accepted: (r.value as any)?.accepted,
        rejected: (r.value as any)?.rejected,
        response: (r.value as any)?.response,
      });
    }
  });

  return {
    ok: true,
    internalSent: results[0]?.status === "fulfilled" ? true : false,
    clientSent: results.length > 1 ? results[1].status === "fulfilled" : false,
    results,
  };
}

