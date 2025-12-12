// src/schemas/catalogos.ts

export const catalogoItemSchema = {
  type: "object",
  properties: {
    id: { type: "integer", minimum: 1 },
    nombre: { type: "string", minLength: 1 }
  },
  required: ["id", "nombre"],
  additionalProperties: false
} as const;

export const catalogoArraySchema = {
  type: "array",
  items: catalogoItemSchema
} as const;
