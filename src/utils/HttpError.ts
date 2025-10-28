import type { ErrorCode } from "./errors";

export class HttpError extends Error {
	public code: ErrorCode;
	public status: number;
	public details?: Record<string, unknown>;

	constructor(status: number, code: ErrorCode, message: string) {
		super(message);
		this.status = status;
		this.code = code;

		Object.setPrototypeOf(this, HttpError.prototype);
	}
}
