import react from "@vitejs/plugin-react";
import path, { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "electron-vite";
import tsconfigPathsPlugin from "vite-tsconfig-paths";

const tsConfigPaths = tsconfigPathsPlugin({
	projects: [path.resolve("tsconfig.json")],
});

export default defineConfig({
	main: {
		plugins: [tsConfigPaths],
		publicDir: resolve("resources"),
	},
	preload: {
		plugins: [tsConfigPaths],
	},
	renderer: {
		define: {
			"process.platform": JSON.stringify(process.platform),
		},
		resolve: {
			alias: {
				// "@renderer": resolve("src/renderer/src"),
				"@renderer": resolve(__dirname, "./src/renderer/src"),
			},
		},
		plugins: [tsConfigPaths, react(), tailwindcss()],
	},
});
