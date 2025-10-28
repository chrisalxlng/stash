import type { NextFunction, Request, Response } from "express";
import { ERRORS } from "../utils/errors";
import { HttpError } from "../utils/HttpError";

const sendErrorResponse = (res: Response, code: keyof typeof ERRORS) => {
	const { message, status } = ERRORS[code];
	return res.status(status).json({ message, code });
};

export const errorHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	console.error(err);

	if (err instanceof HttpError) {
		return sendErrorResponse(res, err.code);
	}

	if (typeof err === "object" && err !== null && "name" in err) {
		const e = err as { name?: string };
		if (e.name === "UnauthorizedError") {
			return sendErrorResponse(res, "MISSING_OR_INVALID_TOKEN");
		}
	}

	return sendErrorResponse(res, "INTERNAL_SERVER_ERROR");
};
