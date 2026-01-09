import "express-serve-static-core";

declare module "express-serve-static-core" {
	interface Request {
		auth?: {
			sub?: string;
			[key: string]: unknown;
		};
	}
}
