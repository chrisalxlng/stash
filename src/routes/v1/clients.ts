import { Router } from "express";
import { createFilesRouter } from "./files";

export const createClientsRouter = (filesDirectory: string) => {
	const clientsRouter = Router();

	const filesRouter = createFilesRouter(filesDirectory);
	clientsRouter.use("/:clientId/files", filesRouter);

	return clientsRouter;
};
