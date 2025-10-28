import path from "node:path";
import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });
