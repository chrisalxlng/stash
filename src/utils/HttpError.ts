export const ERRORS = {
	NO_FILE_PROVIDED: {
		code: "NO_FILE_PROVIDED",
		message: "Missing file in payload",
		status: 400,
	},
	NO_CLIENT_ID_PROVIDED: {
		code: "NO_CLIENT_ID_PROVIDED",
		message: "Missing route parameter clientId",
		status: 400,
	},
	NO_FILE_ID_PROVIDED: {
		code: "NO_FILE_ID_PROVIDED",
		message: "Missing route parameter fileId",
		status: 400,
	},
	MISSING_OR_INVALID_TOKEN: {
		code: "MISSING_OR_INVALID_TOKEN",
		message: "Missing or invalid token",
		status: 401,
	},
	NO_USER_INFO_IN_TOKEN: {
		code: "NO_USER_INFO_IN_TOKEN",
		message: "Missing user information in token",
		status: 401,
	},
	FILE_ACCESS_NOT_ALLOWED: {
		code: "FILE_ACCESS_NOT_ALLOWED",
		message: "File cannot be accessed with the provided credentials or token",
		status: 403,
	},
	FILE_NOT_FOUND: {
		code: "FILE_NOT_FOUND",
		message: "File not found",
		status: 404,
	},
	FILE_METADATA_NOT_FOUND: {
		code: "FILE_METADATA_NOT_FOUND",
		message: "File metadata not found",
		status: 404,
	},
	FILE_SIZE_EXCEEDED: {
		code: "FILE_SIZE_EXCEEDED",
		message: "File size exceeded",
		status: 413,
	},
	FILE_LIMIT_EXCEEDED: {
		code: "FILE_LIMIT_EXCEEDED",
		message: "File limit exceeded",
		status: 422,
	},
	INTERNAL_SERVER_ERROR: {
		code: "INTERNAL_SERVER_ERROR",
		message: "An unexpected error occurred",
		status: 500,
	},
} as const;

export type ErrorKey = keyof typeof ERRORS;

export class HttpError extends Error {
	public code: ErrorKey;
	public status: number;
	public details?: Record<string, unknown>;

	constructor(key: ErrorKey) {
		const { code, message, status } = ERRORS[key];

		super(message);

		this.status = status;
		this.code = code;
		this.message = message;

		Object.setPrototypeOf(this, HttpError.prototype);
	}
}
