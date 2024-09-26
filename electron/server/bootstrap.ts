import "reflect-metadata";
import express from "express";
import cors from "cors";
import { useUserRouter } from "@electron/api/UserApi";

export async function bootstrap() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  const corsOptions = {
    origin: "*",
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
  };
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  useUserRouter(app);

  await app.listen(4000);
}
