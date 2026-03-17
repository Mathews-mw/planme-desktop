import { join } from 'node:path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { app, shell, BrowserWindow, session, ipcMain } from 'electron';

import icon from '../../resources/icon.png';

import './ipc';
import { createShortcuts } from './shortcuts';
import { createTray, registerCloseToTray, setAppQuitting } from './tray';
import { showLocalNotification } from './ipc/notifications/notification';
import { taskNotificationScheduler } from './ipc/notifications/task-notification-scheduler-factory';

export type IShowNotificationPayload = {
	title: string;
	body: string;
	silent?: boolean;
	notificationId?: string;
};

let mainWindow: BrowserWindow | null = null;
let isReadyToNotify = false;

const pendingNotifications: Array<{
	payload: IShowNotificationPayload;
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];

function flushPendingNotifications() {
	if (!mainWindow) return;

	isReadyToNotify = true;

	while (pendingNotifications.length > 0) {
		const { payload, resolve } = pendingNotifications.shift()!;
		resolve(showLocalNotification(mainWindow, payload));
	}
}

function createWindow(): void {
	// Create the browser window.
	const window = new BrowserWindow({
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

	mainWindow = window;

	registerCloseToTray(window);
	createTray(window);
	createShortcuts(window);

	window.on('ready-to-show', () => {
		window.show();
		flushPendingNotifications();
	});

	window.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: 'deny' };
	});

	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		window.loadURL(process.env['ELECTRON_RENDERER_URL']);
	} else {
		window.loadFile(join(__dirname, '../renderer/index.html'));
	}
}

app.whenReady().then(async () => {
	electronApp.setAppUserModelId('com.electron');

	// To quickly bootstrap notifications during development
	if (process.platform === 'win32') {
		app.setAppUserModelId(process.execPath);
	}

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

	ipcMain.handle('notifications:show', (_event, payload: IShowNotificationPayload) => {
		return new Promise((resolve, reject) => {
			if (isReadyToNotify && mainWindow) {
				resolve(showLocalNotification(mainWindow, payload));
				return;
			}

			pendingNotifications.push({ payload, resolve, reject });
		});
	});

	await taskNotificationScheduler.start();
	createWindow();

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('before-quit', () => {
	taskNotificationScheduler.stop();
	setAppQuitting(true);
});

app.on('window-all-closed', () => {
	// Intencionalmente vazio para manter o app vivo mesmo sem janelas abertas
	// Tray vai interceptar o comando para gerenciar quando minimizar o encerrar a aplicação
	// if (process.platform !== 'darwin') {
	// 	app.quit();
	// }
});
