import { BrowserWindow, Notification } from 'electron';

import { IShowNotificationPayload } from '../..';

export function showLocalNotification(window: BrowserWindow, payload: IShowNotificationPayload) {
	console.log('start show notification function: ', payload);

	if (!Notification.isSupported) {
		return { ok: false, message: 'Notifications are not supported on this system.' };
	}

	const notification = new Notification({
		title: payload.title,
		body: payload.body,
		silent: payload.silent ?? false,
	});

	notification.on('click', () => {
		window.show();
		window.focus();

		if (payload.notificationId) {
			window.webContents.send('notifications:clicked', {
				notificationId: payload.notificationId,
			});
		}
	});

	notification.on('show', () => {
		console.log('[main] notificação exibida');
	});

	notification.on('close', () => {
		console.log('[main] notificação fechada');
	});

	notification.show();

	return {
		ok: true,
		message: 'Notificação exibida com sucesso.',
	};
}
