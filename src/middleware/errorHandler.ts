import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { HttpError } from "../utils/HttpError";

const sendErrorResponse = (
	res: Response,
	{ code, message, status }: HttpError,
) => {
	return res.status(status).json({ message, code });
};

export const errorHandler = (
	error: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	console.error(error);

	if (error instanceof HttpError) {
		return sendErrorResponse(res, error);
	}

	if (error instanceof MulterError) {
		if (error.code === "LIMIT_FILE_SIZE") {
			return sendErrorResponse(res, new HttpError("FILE_SIZE_EXCEEDED"));
		}
	}

	if (typeof error === "object" && error !== null && "name" in error) {
		const e = error as { name?: string };
		if (e.name === "UnauthorizedError") {
			return sendErrorResponse(res, new HttpError("MISSING_OR_INVALID_TOKEN"));
		}
	}

	return sendErrorResponse(res, new HttpError("INTERNAL_SERVER_ERROR"));
};
