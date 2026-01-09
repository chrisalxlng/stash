import cors from "cors";
import express from "express";
import { setupSwagger } from "./config/swagger";
import { authenticate } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { createClientsRouter as v1CreateClientsRouter } from "./routes/v1/clients";

export const createApp = (filesDirectory: string) => {
	const app = express();

	const allowedOrigins =
		process.env.CLHUB_STORAGE_ALLOWED_ORIGINS?.split(",") ?? [];

	app.use(
		cors({
			origin: (origin, callback) => {
				if (!origin || allowedOrigins.includes(origin)) {
					callback(null, true);
				} else {
					callback(new Error("Not allowed by CORS"));
				}
			},
			credentials: true,
		}),
	);

	app.options(/.*/, cors());

	app.use(express.json());

	setupSwagger(app, {
		route: "/docs/v1",
		version: "v1",
		apiGlobs: ["./src/routes/v1/**/*.ts"],
		serverUrl: "/v1",
	});

	app.use(authenticate);

	const v1ClientsRouter = v1CreateClientsRouter(filesDirectory);

	app.use("/v1/clients", v1ClientsRouter);

	app.use(errorHandler);

	return app;
};
