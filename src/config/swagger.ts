import type { Express } from "express";
import swaggerJsdoc, { type Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

type SwaggerSetupOptions = {
	route: string;
	version: string;
	apiGlobs: string[];
	serverUrl: string;
};

const createErrorSchema = (
	code: string,
	message: string,
	status: number,
	// biome-ignore lint/suspicious/noExplicitAny: Type safety not needed here
): any => ({
	type: "object",
	properties: {
		error: {
			type: "object",
			properties: {
				code: { type: "string", example: code },
				message: { type: "string", example: message },
				status: { type: "integer", example: status },
			},
			required: ["code", "message", "status"],
		},
	},
	required: ["error"],
});

export const setupSwagger = (
	app: Express,
	{ route, version, apiGlobs, serverUrl }: SwaggerSetupOptions,
) => {
	const options: Options = {
		definition: {
			openapi: "3.0.3",
			info: {
				title: "stash API",
				version,
				description: `File storage API (${version})`,
			},
			servers: [{ url: serverUrl, description: version }],
			paths: {},
			components: {
				securitySchemes: {
					bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
				},
				schemas: {
					NO_FILE_PROVIDED: createErrorSchema(
						"NO_FILE_PROVIDED",
						"Missing file in payload",
						400,
					),
					MISSING_OR_INVALID_TOKEN: createErrorSchema(
						"MISSING_OR_INVALID_TOKEN",
						"Missing or invalid token",
						401,
					),
					NO_USER_INFO_IN_TOKEN: createErrorSchema(
						"NO_USER_INFO_IN_TOKEN",
						"Missing user information in token",
						401,
					),
					FILE_NOT_FOUND: createErrorSchema(
						"FILE_NOT_FOUND",
						"File not found",
						404,
					),
					FILE_METADATA_NOT_FOUND: createErrorSchema(
						"FILE_METADATA_NOT_FOUND",
						"File metadata not found",
						404,
					),
					FILE_ACCESS_NOT_ALLOWED: createErrorSchema(
						"FILE_ACCESS_NOT_ALLOWED",
						"File cannot be accessed with the provided credentials or token",
						403,
					),
					INTERNAL_SERVER_ERROR: createErrorSchema(
						"INTERNAL_SERVER_ERROR",
						"An unexpected error occurred",
						500,
					),
				},
			},
			security: [{ bearerAuth: [] }],
		},
		apis: apiGlobs,
	};

	const spec = swaggerJsdoc(options);
	app.use(route, swaggerUi.serve, swaggerUi.setup(spec));
};
