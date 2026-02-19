import type { Test } from "supertest";

export const withAuthentication = (req: Test) =>
	req.set("x-test-authenticated", "true");

export const withDemoAuthentication = (req: Test) =>
	req.set("x-test-demo-authenticated", "true");
