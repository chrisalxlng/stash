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
			const clientId = req.params.clientId;

			if (!userId || !clientId) {
				return cb(new Error("Missing user or client info"), "");
			}

			const userClientDir = path.join(filesDirectory, userId, clientId);
			fs.mkdirSync(userClientDir, { recursive: true });
			cb(null, userClientDir);
		},
		filename: (req, file, cb) => {
			const userId = req.auth?.sub;
			const clientId = req.params.clientId;
			const fileId = req.params.fileId;

			if (!userId || !clientId) {
				return cb(new Error("Missing user or client info"), "");
			}

			const metaPath = path.join(
				filesDirectory,
				userId,
				clientId,
				`${fileId}.json`,
			);

			const metadata = {
				fileId,
				originalName: file.originalname,
				mimetype: file.mimetype,
				uploadedAt: new Date().toISOString(),
			};

			fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
			cb(null, fileId);
		},
	});

	return {
		save: multer({ storage }),
	};
};
