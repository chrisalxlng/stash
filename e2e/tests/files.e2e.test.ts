import fs from "node:fs";
import { createServer, type Server } from "node:http";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app";
import { MOCKED_USER_ID } from "../mocks/auth.mock";
import { withAuthentication, withDemoAuthentication } from "../utils/auth";
import {
	createFileAccessToken,
	MOCKED_ACCESS_TOKEN_SECRET,
} from "../utils/token";

let server: Server;
let tempDirectory: string;

vi.mock("../../src/middleware/auth", () => ({
	authenticate: vi.fn((req, _, next) => {
		if (req.headers["x-test-authenticated"] === "true") {
			req.auth = { sub: "test-user" };
		} else if (req.headers["x-test-demo-authenticated"] === "true") {
			req.auth = { sub: "test-user", is_demo: true };
		}
		next();
	}),
}));

describe("/v1 endpoints", () => {
	const clientId = "demo-client";
	const defaultFileId = "demo";
	const sampleFile = path.join(__dirname, "../fixtures/sample.txt");
	const sample2File = path.join(__dirname, "../fixtures/sample2.txt");
	const sampleLargeFile = path.join(__dirname, "../fixtures/sample-large.txt");

	const getBaseUrl = (fileId: string) =>
		`/v1/clients/${clientId}/files/${fileId}`;
	const defaultBaseUrl = getBaseUrl(defaultFileId);

	beforeEach(() => {
		vi.stubEnv("FILE_ACCESS_SECRET", MOCKED_ACCESS_TOKEN_SECRET);
		vi.stubEnv("FILE_LIMIT_COUNT", "3");
		vi.stubEnv("DEMO_FILE_LIMIT_COUNT", "1");
		vi.stubEnv("MAX_FILE_SIZE_MB", "1");
		tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "file-service-"));
		const app = createApp(tempDirectory);

		server = createServer(app).listen(0);
	});

	afterEach(async () => {
		vi.unstubAllEnvs();

		if (server) {
			await new Promise((resolve) => server.close(resolve));
		}

		if (fs.existsSync(tempDirectory)) {
			fs.rmSync(tempDirectory, { recursive: true, force: true });
		}
	});

	it("retrieves an existing file", async () => {
		// Arrange
		await withAuthentication(request(server).post(defaultBaseUrl))
			.attach("file", sampleFile)
			.expect(201);

		// Act
		await withAuthentication(request(server).get(defaultBaseUrl)).expect(200);

		// Assert
		const response = await withAuthentication(
			request(server).get(defaultBaseUrl),
		).expect(200);
		const sampleFileContent = fs.readFileSync(sampleFile);
		expect(response.body).toEqual(sampleFileContent);
	});

	it("uploads a file", async () => {
		// Arrange
		// <EMPTY>

		// Act
		await withAuthentication(request(server).post(defaultBaseUrl))
			.attach("file", sampleFile)
			.expect(201);

		// Assert
		const sampleFileContent = fs.readFileSync(sampleFile);
		const filePath = path.join(
			tempDirectory,
			MOCKED_USER_ID,
			clientId,
			defaultFileId,
		);
		const fileContent = fs.readFileSync(filePath);
		expect(sampleFileContent).toEqual(fileContent);
	});

	it("replaces a file", async () => {
		const filePath = path.join(
			tempDirectory,
			MOCKED_USER_ID,
			clientId,
			defaultFileId,
		);
		const sampleFileContent = fs.readFileSync(sampleFile);
		const sampleFile2Content = fs.readFileSync(sample2File);

		// Arrange
		await withAuthentication(request(server).post(defaultBaseUrl))
			.attach("file", sampleFile)
			.expect(201);
		await withAuthentication(request(server).get(defaultBaseUrl)).expect(200);

		const fileContent = fs.readFileSync(filePath);
		expect(sampleFileContent).toEqual(fileContent);

		// Act
		await withAuthentication(request(server).post(defaultBaseUrl))
			.attach("file", sample2File)
			.expect(201);

		// Assert
		const updatedFileContent = fs.readFileSync(filePath);
		expect(sampleFile2Content).toEqual(updatedFileContent);
	});

	it("deletes a file", async () => {
		// Arrange
		await withAuthentication(request(server).post(defaultBaseUrl))
			.attach("file", sampleFile)
			.expect(201);
		await withAuthentication(request(server).get(defaultBaseUrl)).expect(200);

		// Act
		await withAuthentication(request(server).delete(defaultBaseUrl)).expect(
			204,
		);

		// Assert
		await withAuthentication(request(server).get(defaultBaseUrl)).expect(404);
		const filePath = path.join(
			tempDirectory,
			MOCKED_USER_ID,
			clientId,
			defaultFileId,
		);
		const fileExists = fs.existsSync(filePath);
		expect(fileExists).toBeFalsy();
	});

	it("deletes all files of a client", async () => {
		const firstFileUrl = getBaseUrl("file1");
		const secondFileUrl = getBaseUrl("file2");
		const url = `/v1/clients/${clientId}/files`;

		// Arrange
		await withAuthentication(request(server).post(firstFileUrl))
			.attach("file", sampleFile)
			.expect(201);
		await withAuthentication(request(server).get(firstFileUrl)).expect(200);
		await withAuthentication(request(server).post(secondFileUrl))
			.attach("file", sampleFile)
			.expect(201);
		await withAuthentication(request(server).get(secondFileUrl)).expect(200);

		// Act
		await withAuthentication(request(server).delete(url)).expect(204);

		// Assert
		await withAuthentication(request(server).get(firstFileUrl)).expect(404);
		await withAuthentication(request(server).get(secondFileUrl)).expect(404);
	});

	it("returns 404 for non-existing files", async () => {
		// Arrange
		// <EMPTY>

		// Act & Assert
		await withAuthentication(request(server).get(defaultBaseUrl)).expect(404);
		await withAuthentication(request(server).delete(defaultBaseUrl)).expect(
			404,
		);
	});

	it("retrieves a file with token access when allowed", async () => {
		// Arrange
		await withAuthentication(request(server).post(defaultBaseUrl))
			.attach("file", sampleFile)
			.set("x-allow-token-access", "true")
			.expect(201);

		// Act & Assert
		const accessToken = createFileAccessToken(
			MOCKED_USER_ID,
			clientId,
			defaultFileId,
			MOCKED_ACCESS_TOKEN_SECRET,
		);
		const response = await request(server)
			.get(defaultBaseUrl)
			.set("x-file-access-token", accessToken)
			.expect(200);
		const sampleFileContent = fs.readFileSync(sampleFile);
		expect(response.body).toEqual(sampleFileContent);
	});

	it("blocks file retrieval when token access is allowed and token is invalid", async () => {
		// Arrange
		await withAuthentication(request(server).post(defaultBaseUrl))
			.attach("file", sampleFile)
			.set("x-allow-token-access", "true")
			.expect(201);

		// Act & Assert
		const accessToken = createFileAccessToken(
			MOCKED_USER_ID,
			clientId,
			defaultFileId,
			"wrong-secret",
		);
		await request(server)
			.get(defaultBaseUrl)
			.set("x-file-access-token", accessToken)
			.expect(403);
	});

	it("blocks file upload when file size exceeds limit", async () => {
		// Arrange
		// <EMPTY>

		// Act
		await withAuthentication(request(server).post(defaultBaseUrl))
			.attach("file", sampleLargeFile) // File is larger than 1 MB
			.expect(413);

		// Assert
		const filePath = path.join(
			tempDirectory,
			MOCKED_USER_ID,
			clientId,
			defaultFileId,
		);
		const fileExists = fs.existsSync(filePath);
		expect(fileExists).toBeFalsy();
	});

	it("blocks file upload when file count exceeds limit", async () => {
		// Arrange
		for (let i = 0; i < 3; i++) {
			await withAuthentication(request(server).post(getBaseUrl(`file${i}`)))
				.attach("file", sampleFile)
				.expect(201);
		}

		// Act
		await withAuthentication(request(server).post(defaultBaseUrl))
			.attach("file", sampleFile)
			.expect(422);

		// Assert
		const filePath = path.join(
			tempDirectory,
			MOCKED_USER_ID,
			clientId,
			defaultFileId,
		);
		const fileExists = fs.existsSync(filePath);
		expect(fileExists).toBeFalsy();
	});

	it("blocks file upload when file count exceeds demo limit", async () => {
		// Arrange
		await withDemoAuthentication(request(server).post(getBaseUrl("file1")))
			.attach("file", sampleFile)
			.expect(201);

		// Act
		await withDemoAuthentication(request(server).post(defaultBaseUrl))
			.attach("file", sampleFile)
			.expect(422);

		// Assert
		const filePath = path.join(
			tempDirectory,
			MOCKED_USER_ID,
			clientId,
			defaultFileId,
		);
		const fileExists = fs.existsSync(filePath);
		expect(fileExists).toBeFalsy();
	});
});
