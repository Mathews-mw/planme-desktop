import { join } from 'node:path';
import { app, shell, BrowserWindow, session } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';

import icon from '../../resources/icon.png';

import './ipc';

function createWindow(): void {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 1120,
		height: 700,
		minWidth: 390,
		minHeight: 520,
		show: false,
		autoHideMenuBar: true,
		titleBarStyle: 'hiddenInset',
		darkTheme: true,
		backgroundColor: '#f1f5f9', // light
		// backgroundColor: "#17141f", // dark
		title: 'Plan Me',
		...(process.platform === 'linux' ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, '../preload/index.mjs'),
			// Ensure context isolation so preload can safely expose APIs
			contextIsolation: true,
			// Disable nodeIntegration in renderer for security
			nodeIntegration: false,
			sandbox: false,
		},
	});

	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: 'deny' };
	});

	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
	}
}

app.whenReady().then(() => {
	electronApp.setAppUserModelId('com.electron');

	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		const csp = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: blob: https:",
			"font-src 'self' data:",
			"connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com",
		].join('; ');

		callback({
			responseHeaders: {
				...details.responseHeaders,
				'Content-Security-Policy': [csp],
			},
		});
	});

	createWindow();

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
