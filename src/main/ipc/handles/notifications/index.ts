import { ipcMain } from 'electron';

import { IPC } from '~/src/shared/constants/ipc';
import { IpcResponse } from '~/src/shared/types/ipc';
import { TaskNotificationScheduler } from '../../notifications/task-notification-scheduler';

interface RegisterIpcParams {
	taskNotificationScheduler: TaskNotificationScheduler;
}

export function registerNotificationsIpc({ taskNotificationScheduler }: RegisterIpcParams) {
	ipcMain.handle(IPC.NOTIFICATIONS.SYNC, async (_event, taskDefinitionId: string): Promise<IpcResponse<null>> => {
		await taskNotificationScheduler.syncTaskDefinition(taskDefinitionId);

		return { success: true, data: null };
	});

	ipcMain.handle(IPC.NOTIFICATIONS.RELOAD, async (): Promise<IpcResponse<null>> => {
		await taskNotificationScheduler.reloadUpcoming();

		return { success: true, data: null };
	});
}
