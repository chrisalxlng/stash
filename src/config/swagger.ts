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
			schemas: {
				NO_FILE_PROVIDED: {
					type: "object",
					properties: {
						error: {
							type: "object",
							properties: {
								code: { type: "string", example: "NO_FILE_PROVIDED" },
								message: { type: "string", example: "Missing file in payload" },
								status: { type: "integer", example: 400 },
							},
						},
					},
				},
				MISSING_OR_INVALID_TOKEN: {
					type: "object",
					properties: {
						error: {
							type: "object",
							properties: {
								code: { type: "string", example: "MISSING_OR_INVALID_TOKEN" },
								message: {
									type: "string",
									example: "Missing or invalid token",
								},
								status: { type: "integer", example: 401 },
							},
						},
					},
				},
				NO_USER_INFO_IN_TOKEN: {
					type: "object",
					properties: {
						error: {
							type: "object",
							properties: {
								code: { type: "string", example: "NO_USER_INFO_IN_TOKEN" },
								message: {
									type: "string",
									example: "Missing user information in token",
								},
								status: { type: "integer", example: 401 },
							},
						},
					},
				},
				FILE_NOT_FOUND: {
					type: "object",
					properties: {
						error: {
							type: "object",
							properties: {
								code: { type: "string", example: "FILE_NOT_FOUND" },
								message: { type: "string", example: "File not found" },
								status: { type: "integer", example: 404 },
							},
						},
					},
				},
				INTERNAL_SERVER_ERROR: {
					type: "object",
					properties: {
						error: {
							type: "object",
							properties: {
								code: { type: "string", example: "INTERNAL_SERVER_ERROR" },
								message: {
									type: "string",
									example: "An unexpected error occurred",
								},
								status: { type: "integer", example: 500 },
							},
						},
					},
				},
			},
		},
		security: [{ bearerAuth: [] }],
	},
	apis: ["./src/routes/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
	app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
