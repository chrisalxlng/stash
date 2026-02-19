import fs from "node:fs";
import path from "node:path";
import type { FileMetadata } from "../types/FileMetadata";

export const deleteExpiredFiles = (filesDirectory: string) => {
	let deletedCount = 0;
	const walk = (dir: string) => {
		if (!fs.existsSync(dir)) return;
		for (const entry of fs.readdirSync(dir)) {
			const fullPath = path.join(dir, entry);
			if (fs.statSync(fullPath).isDirectory()) {
				walk(fullPath);
			} else if (entry.endsWith(".json")) {
				try {
					const metadata: FileMetadata = JSON.parse(
						fs.readFileSync(fullPath, "utf8"),
					);
					if (metadata.expiresAt && new Date(metadata.expiresAt) < new Date()) {
						const filePath = fullPath.replace(/\.json$/, "");
						if (fs.existsSync(filePath)) {
							fs.unlinkSync(filePath);
							console.log(`Deleted file: ${filePath}`);
						}
						fs.unlinkSync(fullPath);
						console.log(`Deleted metadata: ${fullPath}`);
						deletedCount++;
					}
				} catch {}
			}
		}
	};
	walk(filesDirectory);
	if (deletedCount > 0) {
		console.log(`Total deleted: ${deletedCount}`);
	}
};
