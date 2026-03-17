import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

interface IAppPreferences {
	suppressCloseToTrayNotice?: boolean;
}

const preferencesFilePath = path.join(app.getPath('userData'), 'preferences.json');

console.log('Preferences File Path: ', preferencesFilePath);

async function readPreferences(): Promise<IAppPreferences> {
	try {
		const content = await fs.readFile(preferencesFilePath, 'utf-8');
		return JSON.parse(content) as IAppPreferences;
	} catch {
		return {};
	}
}

async function writePreferences(preferences: IAppPreferences): Promise<void> {
	await fs.mkdir(path.dirname(preferencesFilePath), { recursive: true });
	await fs.writeFile(preferencesFilePath, JSON.stringify(preferences, null, 2), 'utf-8');
}

export async function shouldSuppressCloseToTrayNotice(): Promise<boolean> {
	const preferences = await readPreferences();
	return preferences.suppressCloseToTrayNotice === true;
}

export async function setSuppressCloseToTrayNotice(value: boolean): Promise<void> {
	const preferences = await readPreferences();

	await writePreferences({
		...preferences,
		suppressCloseToTrayNotice: value,
	});
}
