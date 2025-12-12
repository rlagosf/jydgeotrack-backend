import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 4001),

  DB: {
    HOST: process.env.DB_HOST,
    PORT: Number(process.env.DB_PORT || 3306),
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    NAME: process.env.DB_NAME,
  },
};
