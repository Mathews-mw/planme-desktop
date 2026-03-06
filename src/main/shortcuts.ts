import { app, BrowserWindow, globalShortcut } from 'electron';

export function createShortcuts(window: BrowserWindow) {
	app.on('browser-window-focus', () => {
		globalShortcut.register('CommandOrControl+K', () => {
			window.webContents.send('search-task');
		});
	});

	app.on('browser-window-blur', () => {
		globalShortcut.unregisterAll();
	});
}
