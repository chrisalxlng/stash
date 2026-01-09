import fs from "node:fs";
import path from "node:path";
import { type Request, Router } from "express";
import { createStorage } from "../../config/storage";
import { validateAuthToken } from "../../middleware/validateAuthToken";
import { throwError } from "../../utils/errors";
import { verifyFileAccessToken } from "../../utils/fileAccessToken";
import { readFileMetadata } from "../../utils/readFileMetadata";

type AuthRequest<P extends Record<string, unknown> = Record<string, unknown>> =
	Request<P> & { auth?: { sub?: string } };

export const createFilesRouter = (filesDirectory: string) => {
	const filesRouter = Router({ mergeParams: true });
	const storage = createStorage(filesDirectory);

	/**
	 * @openapi
	 * /clients/{clientId}/files/{fileId}:
	 *   post:
	 *     summary: Upload a file
	 *     description: >
	 *       Uploads or replaces a file for the authenticated user.
	 *       The file can optionally be marked as accessible via a file access token
	 *       by providing the `x-allow-token-access` header.
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: clientId
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - in: path
	 *         name: fileId
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - in: header
	 *         name: x-allow-token-access
	 *         description: >
	 *           If set to 'true', the file can be accessed using a valid file access token instead of authentication.
	 *         required: false
	 *         schema:
	 *           type: string
	 *           enum: ['true', 'false']
	 *           default: 'false'
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         multipart/form-data:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - file
	 *             properties:
	 *               file:
	 *                 type: string
	 *                 format: binary
	 *     responses:
	 *       201:
	 *         description: File uploaded successfully
	 *       400:
	 *         description: Missing file in payload
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/NO_FILE_PROVIDED'
	 *       401:
	 *         description: Missing or invalid authentication token
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/MISSING_OR_INVALID_TOKEN'
	 */
	filesRouter.post(
		"/:fileId",
		validateAuthToken,
		storage.save.single("file"),
		(req, res) => {
			if (!req.file) return throwError("NO_FILE_PROVIDED");

			res.sendStatus(201);
		},
	);

	/**
	 * @openapi
	 * /clients/{clientId}/files/{fileId}:
	 *   get:
	 *     summary: Download a file
	 *     description: >
	 *       Downloads a file by client ID and file ID.
	 *
	 *       Access rules:
	 *       - If the file is **auth-only**, the request must be authenticated and the authenticated user must be the file owner.
	 *       - If the file allows **token access**, the file can be accessed either by the authenticated owner
	 *         or by providing a valid file access token via the `X-File-Access-Token` header.
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: clientId
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - in: path
	 *         name: fileId
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - in: header
	 *         name: X-File-Access-Token
	 *         required: false
	 *         schema:
	 *           type: string
	 *         description: File access token for unauthenticated or public access
	 *     responses:
	 *       200:
	 *         description: Returns the requested file
	 *         content:
	 *           application/octet-stream:
	 *             schema:
	 *               type: string
	 *               format: binary
	 *       401:
	 *         description: Missing or invalid authentication or access token
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/MISSING_OR_INVALID_TOKEN'
	 *       403:
	 *         description: File access is not allowed with the provided credentials
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/FILE_ACCESS_NOT_ALLOWED'
	 *       404:
	 *         description: File or file metadata not found
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/FILE_NOT_FOUND'
	 */
	filesRouter.get(
		"/:fileId",
		(req: AuthRequest<{ clientId: string; fileId: string }>, res) => {
			const { clientId, fileId } = req.params;
			const authUserId = req.auth?.sub;

			let ownerUserId = authUserId;

			const token = req.header("x-file-access-token");
			const tokenPayload =
				typeof token === "string"
					? verifyFileAccessToken(token, clientId, fileId)
					: null;

			if (!ownerUserId && tokenPayload) {
				ownerUserId = tokenPayload.ownerUserId;
			}

			if (!ownerUserId) {
				return throwError("FILE_ACCESS_NOT_ALLOWED");
			}

			const baseDir = path.join(filesDirectory, ownerUserId, clientId);
			const filePath = path.join(baseDir, fileId);
			const metaPath = path.join(baseDir, `${fileId}.json`);

			if (!fs.existsSync(filePath)) {
				return throwError("FILE_NOT_FOUND");
			}

			const metadata = readFileMetadata(metaPath);

			if (!metadata.allowTokenAccess && authUserId !== ownerUserId) {
				return throwError("FILE_ACCESS_NOT_ALLOWED");
			}

			return res.sendFile(filePath);
		},
	);

	/**
	 * @openapi
	 * /clients/{clientId}/files/{fileId}:
	 *   delete:
	 *     summary: Delete a file
	 *     description: Deletes a file and its metadata by client ID and file ID for the authenticated user.
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: clientId
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - in: path
	 *         name: fileId
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       200:
	 *         description: File deleted successfully, no response body
	 *       401:
	 *         description: Missing user information in token
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/NO_USER_INFO_IN_TOKEN'
	 *       404:
	 *         description: File not found
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/FILE_NOT_FOUND'
	 *       500:
	 *         description: Internal server error while deleting file
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/INTERNAL_SERVER_ERROR'
	 */
	filesRouter.delete(
		"/:fileId",
		(req: AuthRequest<{ clientId: string; fileId: string }>, res) => {
			const userId = req.auth?.sub;
			if (!userId) return throwError("NO_USER_INFO_IN_TOKEN");

			const { clientId, fileId } = req.params;
			const filePath = path.join(filesDirectory, userId, clientId, fileId);
			const metaPath = path.join(
				filesDirectory,
				userId,
				clientId,
				`${fileId}.json`,
			);

			if (!fs.existsSync(filePath)) return throwError("FILE_NOT_FOUND");

			try {
				fs.unlinkSync(filePath);

				if (fs.existsSync(metaPath)) {
					fs.unlinkSync(metaPath);
				}

				return res.sendStatus(204);
			} catch {
				return throwError("INTERNAL_SERVER_ERROR");
			}
		},
	);

	/**
	 * @openapi
	 * /clients/{clientId}/files:
	 *   delete:
	 *     summary: Delete all files of a client
	 *     description: Deletes all files and metadata for a given client ID belonging to the authenticated user.
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: clientId
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       200:
	 *         description: All files for the client deleted successfully, no response body
	 *       401:
	 *         description: Missing user information in token
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/NO_USER_INFO_IN_TOKEN'
	 *       404:
	 *         description: No files found for this client
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/FILE_NOT_FOUND'
	 *       500:
	 *         description: Internal server error while deleting files
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/INTERNAL_SERVER_ERROR'
	 */
	filesRouter.delete("/", (req: AuthRequest<{ clientId: string }>, res) => {
		const userId = req.auth?.sub;
		if (!userId) return throwError("NO_USER_INFO_IN_TOKEN");

		const { clientId } = req.params;
		const clientDir = path.join(filesDirectory, userId, clientId);

		if (!fs.existsSync(clientDir)) return throwError("FILE_NOT_FOUND");

		try {
			fs.rmSync(clientDir, { recursive: true, force: true });

			return res.sendStatus(204);
		} catch {
			return throwError("INTERNAL_SERVER_ERROR");
		}
	});

	return filesRouter;
};
