import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://localhost:5432/retailiq",
});

pool.on("connect", (client) => {
  client.query("SET search_path TO retailiq, public");
});
