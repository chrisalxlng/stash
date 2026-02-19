import fs from "node:fs";
import path from "node:path";
import multer from "multer";

export const createStorage = (filesDirectory: string) => {
	if (!fs.existsSync(filesDirectory)) {
		fs.mkdirSync(filesDirectory, { recursive: true });
	}

	const storage = multer.diskStorage({
		destination: (req, _file, cb) => {
			const userId = req.auth?.sub;
			const clientId = req.params.clientId as string;

			if (!userId || !clientId) {
				return cb(new Error("Missing user or client info"), "");
			}

			const userClientDir = path.join(filesDirectory, userId, clientId);
			fs.mkdirSync(userClientDir, { recursive: true });
			cb(null, userClientDir);
		},
		filename: (req, _, cb) => {
			const fileId = req.params.fileId as string;

			cb(null, fileId);
		},
	});

	const maxFileSizeEnv = Number(process.env.MAX_FILE_SIZE_MB);
	const maxFileSize = maxFileSizeEnv * 1_000_000;

	return {
		save: multer({ storage, limits: { fileSize: maxFileSize } }),
	};
};
