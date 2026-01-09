import type { NextFunction } from "express";
import type { Request } from "express-jwt";
import { vi } from "vitest";

export const MOCKED_USER_ID = "test-user";

export const authenticateMock = vi.fn(
	(req: Request, _res: Response, next: NextFunction) => {
		if (req.headers["x-test-authenticated"] === "true") {
			req.auth = { sub: MOCKED_USER_ID };
		}
		next();
	},
);
