import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";


import { startServer } from "./server";

startServer().catch((err:unknown) => {
  console.error("❌ Server failed to start:", err);
  process.exit(1);
});





