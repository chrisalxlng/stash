import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/HttpError";

export const validateFileLimit = (filesDirectory: string) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		const { auth } = req;
		const userId = auth?.sub;
		const clientId = req.params.clientId;
		const fileId = req.params.fileId;

		if (!auth || !userId) throw new HttpError("MISSING_OR_INVALID_TOKEN");
		if (!clientId) throw new HttpError("NO_CLIENT_ID_PROVIDED");
		if (!fileId) throw new HttpError("NO_FILE_ID_PROVIDED");

		const isDemo = auth.is_demo ?? false;
		const limitEnv = isDemo
			? Number(process.env.DEMO_FILE_LIMIT_COUNT)
			: Number(process.env.FILE_LIMIT_COUNT);
		const limit = Number.isFinite(limitEnv) ? limitEnv : 0;

		const userDir = path.join(filesDirectory, userId);
		let fileCount = 0;

		if (fs.existsSync(userDir)) {
			const walk = (dir: string) => {
				for (const entry of fs.readdirSync(dir)) {
					const fullPath = path.join(dir, entry);
					if (fs.statSync(fullPath).isDirectory()) {
						walk(fullPath);
					} else if (entry.endsWith(".json")) {
						fileCount++;
					}
				}
			};
			walk(userDir);
		}

		if (fileCount >= limit) throw new HttpError("FILE_LIMIT_EXCEEDED");

		next();
	};
};
