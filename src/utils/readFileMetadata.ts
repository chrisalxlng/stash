import fs from "node:fs";
import type { FileMetadata } from "../types/FileMetadata";
import { throwError } from "./errors";

export const readFileMetadata = (metaPath: string): FileMetadata => {
	if (!fs.existsSync(metaPath)) {
		return throwError("FILE_METADATA_NOT_FOUND");
	}

	return JSON.parse(fs.readFileSync(metaPath, "utf8")) as FileMetadata;
};
