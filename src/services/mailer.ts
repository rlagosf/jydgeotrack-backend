import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendContactoEmail(payload: any) {
  const to = process.env.MAIL_TO!;
  const from = process.env.MAIL_FROM!;

  const subject = `Nueva solicitud — ${payload.nombre_razon_social} (${payload.cantidad_vehiculos} vehículos)`;

  // Texto plano (rápido, sólido)
  const text = `
Nueva solicitud — JD GeoTrack

Nombre / Razón social: ${payload.nombre_razon_social}
Correo: ${payload.correo}
Teléfono: ${payload.telefono}

Región: ${payload.region_nombre ?? "-"} (ID ${payload.region_id ?? "-"})
Provincia: ${payload.provincia_nombre ?? "-"} (ID ${payload.provincia_id ?? "-"})
Comuna: ${payload.comuna_nombre ?? "-"} (ID ${payload.comuna_id ?? "-"})

Tipo cliente: ${payload.tipo_cliente_nombre ?? "-"} (ID ${payload.tipo_cliente_id ?? "-"})
Cantidad vehículos: ${payload.cantidad_vehiculos ?? "-"}

Tipo vehículo: ${payload.tipo_vehiculo_nombre ?? "-"} (ID ${payload.tipo_vehiculo_id ?? "-"})
Objetivo rastreo: ${payload.objetivo_nombre ?? "-"} (ID ${payload.objetivo_rastreo_id ?? "-"})
¿Usa GPS?: ${payload.usa_gps_nombre ?? "-"} (ID ${payload.usa_gps_id ?? "-"})
Plazo implementación: ${payload.plazo_nombre ?? "-"} (ID ${payload.plazo_implementacion_id ?? "-"})

Detalle:
${payload.detalle_requerimiento ?? "-"}
`.trim();

  return mailer.sendMail({
    from,
    to,
    replyTo: payload.correo, // 👈 para responder al cliente directamente
    subject,
    text,
  });
}
