import type { Express } from "express";
import swaggerJsdoc, { type Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: Options = {
	definition: {
		openapi: "3.0.3",
		info: {
			title: "clhub-storage API",
			version: "1.0.0",
			description: "File storage API for clhub with Keycloak authentication",
		},
		paths: {},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		security: [{ bearerAuth: [] }],
	},
	apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
	app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
