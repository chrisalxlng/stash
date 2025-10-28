import { HttpError } from "./HttpError";

export const ERRORS = {
	NO_FILE_PROVIDED: {
		message: "Missing file in payload",
		status: 400,
	},
	MISSING_OR_INVALID_TOKEN: {
		message: "Missing or invalid token",
		status: 401,
	},
	NO_USER_INFO_IN_TOKEN: {
		message: "Missing user information in token",
		status: 401,
	},
	FILE_NOT_FOUND: {
		message: "File not found",
		status: 404,
	},
	INTERNAL_SERVER_ERROR: {
		message: "An unexpected error occurred",
		status: 500,
	},
} as const;

export type ErrorCode = keyof typeof ERRORS;

export const throwError = (code: ErrorCode): never => {
	const { message, status } = ERRORS[code];
	throw new HttpError(status, code, message);
};
