import path from 'node:path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema';

let sqlite: Database.Database | null = null;

export function getDb() {
	if (!sqlite) {
		const dbPath = path.join(app.getPath('userData'), 'planme.sqlite');
		sqlite = new Database(dbPath);
		sqlite.pragma('journal_mode = WAL');
	}

	return drizzle(sqlite!, { schema });
}
