// src/schemas/contacto.ts

export const contactoBodyJsonSchema = {
  type: "object",

  properties: {
    // ------------------
    // Datos base
    // ------------------
    nombre_razon_social: { type: "string", minLength: 1 },
    correo: { type: "string", format: "email", minLength: 5 },
    telefono: { type: "string", minLength: 5 },

    // ------------------
    // Geografía (catálogos)
    // ------------------
    region_id: { type: ["integer", "null"], minimum: 1 },
    ciudad_id: { type: ["integer", "null"], minimum: 1 },
    comuna_id: { type: ["integer", "null"], minimum: 1 },

    // ------------------
    // Negocio
    // ------------------
    tipo_cliente_id: { type: "integer", minimum: 1 },
    cantidad_vehiculos: { type: "integer", minimum: 1 },

    tipo_vehiculo_id: { type: ["integer", "null"], minimum: 1 },
    objetivo_rastreo_id: { type: ["integer", "null"], minimum: 1 },
    usa_gps_id: { type: ["integer", "null"], minimum: 1 },
    plazo_implementacion_id: { type: ["integer", "null"], minimum: 1 },

    // ------------------
    // Texto libre
    // ------------------
    detalle_requerimiento: { type: ["string", "null"], maxLength: 2000 },

    // ------------------
    // Consentimiento (OBLIGATORIO)
    // ------------------
    acepta_contacto: { type: "boolean", const: true },
  },

  required: [
    "nombre_razon_social",
    "correo",
    "telefono",
    "tipo_cliente_id",
    "cantidad_vehiculos",
    "acepta_contacto",
  ],

  additionalProperties: false,
} as const;

export interface ContactoBody {
  nombre_razon_social: string;
  correo: string;
  telefono: string;

  region_id?: number | null;
  ciudad_id?: number | null;
  comuna_id?: number | null;

  tipo_cliente_id: number;
  cantidad_vehiculos: number;

  tipo_vehiculo_id?: number | null;
  objetivo_rastreo_id?: number | null;
  usa_gps_id?: number | null;
  plazo_implementacion_id?: number | null;

  detalle_requerimiento?: string | null;

  acepta_contacto: true; // <- literal true, no boolean
}
