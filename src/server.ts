import path from "node:path";
import "./config/env";
import { createApp } from "./app";

const port = 3000;

export const filesDirectory = path.resolve("./files");
const app = createApp(filesDirectory);
app.listen(port, () => {
	console.log(`🚀 stash running at http://localhost:${port}`);
});
