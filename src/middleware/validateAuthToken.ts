import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/HttpError";

export const validateAuthToken = (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	const userId = req.auth?.sub;

	if (!userId) {
		throw new HttpError("MISSING_OR_INVALID_TOKEN");
	}

	next();
};
