import type { Test } from "supertest";

export const withAuthentication = (req: Test) =>
	req.set("x-test-authenticated", "true");
