import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/main/db/schema.ts',
	out: './src/main/db/migrations',
	dialect: 'sqlite',
	dbCredentials: {
		// drizzle-kit precisa de um arquivo. Pode apontar pra um sqlite de dev
		url: './dev.sqlite',
	},
});
