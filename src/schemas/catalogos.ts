// src/schemas/catalogos.ts

// ---------------------------
// Catálogos geográficos: { id, nombre }
// ---------------------------
export const catalogoNombreItemSchema = {
  type: "object",
  properties: {
    id: { type: "integer", minimum: 1 },
    nombre: { type: "string", minLength: 1 },
  },
  required: ["id", "nombre"],
  additionalProperties: false,
} as const;

export const catalogoNombreArraySchema = {
  type: "array",
  items: catalogoNombreItemSchema,
} as const;

// ---------------------------
// Catálogos negocio: { id, descripcion }
// ---------------------------
export const catalogoDescripcionItemSchema = {
  type: "object",
  properties: {
    id: { type: "integer", minimum: 1 },
    descripcion: { type: "string", minLength: 1 },
  },
  required: ["id", "descripcion"],
  additionalProperties: false,
} as const;

export const catalogoDescripcionArraySchema = {
  type: "array",
  items: catalogoDescripcionItemSchema,
} as const;

// ---------------------------
// Opcional: schema flexible (acepta nombre O descripcion)
// Útil si quieres reutilizar en endpoints mezclados
// ---------------------------
export const catalogoItemFlexibleSchema = {
  type: "object",
  properties: {
    id: { type: "integer", minimum: 1 },
    nombre: { type: "string", minLength: 1 },
    descripcion: { type: "string", minLength: 1 },
  },
  required: ["id"],
  anyOf: [
    { required: ["nombre"] },
    { required: ["descripcion"] },
  ],
  additionalProperties: false,
} as const;

export const catalogoArrayFlexibleSchema = {
  type: "array",
  items: catalogoItemFlexibleSchema,
} as const;
