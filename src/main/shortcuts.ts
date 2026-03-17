import { app, BrowserWindow, globalShortcut } from 'electron';

export function createShortcuts(window: BrowserWindow) {
	app.on('browser-window-focus', () => {
		globalShortcut.register('CommandOrControl+T', () => {
			window.webContents.send('new-task');
		});
	});

	app.on('browser-window-blur', () => {
		globalShortcut.unregisterAll();
	});
}
