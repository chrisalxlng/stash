import { verify } from "jsonwebtoken";
import type { FileAccessTokenPayload } from "../types/FileAccessTokenPayload";

const getSecret = () => {
	const secret = process.env.FILE_ACCESS_SECRET;
	if (!secret) throw new Error("FILE_ACCESS_SECRET is not set");
	return secret;
};

export const verifyFileAccessToken = (
	token: string,
	clientId: string,
	fileId: string,
): FileAccessTokenPayload | null => {
	const fileAccessSecret = getSecret();

	try {
		const payload = verify(token, fileAccessSecret) as FileAccessTokenPayload;

		if (payload.clientId !== clientId || payload.fileId !== fileId) {
			return null;
		}

		return payload;
	} catch {
		return null;
	}
};
