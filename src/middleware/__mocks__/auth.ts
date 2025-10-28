import type { NextFunction } from "express";
import type { Request } from "express-jwt";

export const MOCKED_USER_ID = "test-user";

export const authenticate = (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	req.auth = { sub: MOCKED_USER_ID };
	next();
};
