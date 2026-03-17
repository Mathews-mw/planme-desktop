import { app, BrowserWindow, dialog, Menu, nativeImage, Tray } from 'electron';
import path from 'node:path';
import { cwd } from 'node:process';
import { setSuppressCloseToTrayNotice, shouldSuppressCloseToTrayNotice } from './close-to-tray-preferences';

let trayInstance: Tray | null = null;
let isQuitting = false;
let isHandlingCloseToTray = false;

function getTrayIcon() {
	const icoIconPath = path.resolve(cwd(), 'resources', 'icon.ico');
	const pngIconPath = path.resolve(cwd(), 'resources', 'planme-template.png');
	const iconPath = process.platform === 'win32' ? icoIconPath : pngIconPath;

	const icon = nativeImage.createFromPath(iconPath);

	return icon;
}

export function setAppQuitting(value: boolean) {
	isQuitting = value;
}

export function createTray(window: BrowserWindow) {
	if (trayInstance) return trayInstance;

	const icon = getTrayIcon();
	trayInstance = new Tray(icon);

	trayInstance.setToolTip('Plan Me');

	const contextMenu = Menu.buildFromTemplate([
		// { label: 'PlanMe', enabled: false },
		{ label: 'Open', click: () => showMainWindow(window) },
		{ type: 'separator' },
		{ label: 'Create new task', click: () => window.webContents.send('new-task') },
		{ type: 'separator' },
		{ label: 'Recently', enabled: false },
		{ label: 'Task 1', enabled: false },
		{ label: 'Task 2', enabled: false },
		{ label: 'Task 3', enabled: false },
		{ type: 'separator' },
		{
			label: 'Exit Plan Me',
			click: () => {
				isQuitting = true;
				app.quit();
			},
		},
	]);

	trayInstance.setContextMenu(contextMenu);

	trayInstance.on('click', () => {
		if (window.isVisible()) {
			window.hide();

			if (process.platform === 'win32') {
				window.setSkipTaskbar(true);
			}

			return;
		}

		showMainWindow(window);
	});

	return trayInstance;
}

export function registerCloseToTray(window: BrowserWindow) {
	window.on('close', (event) => {
		if (isQuitting) {
			return;
		}

		event.preventDefault();

		if (isHandlingCloseToTray) {
			return;
		}

		isHandlingCloseToTray = true;

		void (async () => {
			try {
				const suppressNotice = await shouldSuppressCloseToTrayNotice();

				if (!suppressNotice) {
					const result = await dialog.showMessageBox(window, {
						type: 'info',
						buttons: ['Continue'],
						defaultId: 0,
						cancelId: 0,
						title: 'Background application',
						message: 'The app will continue running in the background in the system tray.',
						detail: 'To completely close the application, use the "Exit" option in the system tray menu.',
						checkboxLabel: "Got it! Don't show it again.",
						checkboxChecked: false,
						noLink: true,
					});

					if (result.checkboxChecked) {
						await setSuppressCloseToTrayNotice(true);
					}
				}

				window.hide();

				if (process.platform === 'win32') {
					window.setSkipTaskbar(true);
				}
			} finally {
				isHandlingCloseToTray = false;
			}
		})();
	});

	window.on('show', () => {
		if (process.platform === 'win32') {
			window.setSkipTaskbar(false);
		}
	});
}

export function showMainWindow(window: BrowserWindow) {
	if (window.isMinimized()) {
		window.restore();
	}

	window.setSkipTaskbar(false);
	window.show();
	window.focus();
}
