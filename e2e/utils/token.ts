import jwt from "jsonwebtoken";
import type { FileAccessTokenPayload } from "../../src/types/FileAccessTokenPayload";

export const MOCKED_ACCESS_TOKEN_SECRET = "secret";

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export const createFileAccessToken = (
	ownerUserId: string,
	clientId: string,
	fileId: string,
	secret: string,
	ttlMs: number = DEFAULT_TTL_MS,
): string => {
	const payload: FileAccessTokenPayload = {
		ownerUserId,
		clientId,
		fileId,
	};

	return jwt.sign(payload, secret, {
		expiresIn: Math.floor(ttlMs / 1000),
	});
};
