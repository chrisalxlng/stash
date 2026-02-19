import path from "node:path";
import "./config/env";
import { createApp } from "./app";
import { deleteExpiredFiles } from "./utils/deleteExpiredFiles";

const port = 3000;

export const filesDirectory = path.resolve("./files");
const app = createApp(filesDirectory);
app.listen(port, () => {
	console.log(`🚀 stash running at http://localhost:${port}`);
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const runCleanup = () => {
	try {
		console.log("Checking for expired files...");
		deleteExpiredFiles(filesDirectory);
	} catch (err) {
		console.error("Error deleting expired files:", err);
	}
};
runCleanup();
setInterval(runCleanup, MS_PER_DAY);
