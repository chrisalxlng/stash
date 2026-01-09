import type { NextFunction, Request, Response } from "express";
import { throwError } from "../utils/errors";

export const validateAuthToken = (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	const userId = req.auth?.sub;

	if (!userId) {
		return throwError("MISSING_OR_INVALID_TOKEN");
	}

	next();
};
