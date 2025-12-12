// src/schemas/contacto.ts

export const contactoBodyJsonSchema = {
  type: "object",
  properties: {
    nombre: { type: "string", minLength: 1 },
    correo: { type: "string", format: "email", minLength: 5 },
    telefono: { type: "string", minLength: 5 },

    region_id: { type: ["integer", "null"], minimum: 1 },
    ciudad_id: { type: ["integer", "null"], minimum: 1 },
    comuna_id: { type: ["integer", "null"], minimum: 1 },

    tipo_cliente_id: { type: "integer", minimum: 1 },
    cantidad_vehiculos: { type: "integer", minimum: 1 },

    tipo_vehiculo_id: { type: ["integer", "null"], minimum: 1 },
    objetivo_rastreo_id: { type: ["integer", "null"], minimum: 1 },
    usa_gps_id: { type: ["integer", "null"], minimum: 1 },
    plazo_id: { type: ["integer", "null"], minimum: 1 },

    detalle: { type: ["string", "null"], maxLength: 2000 },

    acepta_contacto: { type: "boolean" }
  },

  required: [
    "nombre",
    "correo",
    "telefono",
    "tipo_cliente_id",
    "cantidad_vehiculos",
    "acepta_contacto"
  ],

  additionalProperties: false
} as const;

export interface ContactoBody {
  nombre: string;
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
  plazo_id?: number | null;

  detalle?: string | null;

  acepta_contacto: boolean;
}
