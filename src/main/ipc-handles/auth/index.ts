import { ipcMain } from 'electron';

import { store } from '../../store';
import { IUser } from '~/src/shared/types/user';
import { IPC } from '~/src/shared/constants/ipc';
import { IpcResponse } from '~/src/shared/types/ipc';

ipcMain.handle(IPC.AUTH.GET_LAST_ACTIVE_USER, async (): Promise<IpcResponse<IUser | null>> => {
	const uid = store.get('auth.lastActiveUserId');

	if (!uid) {
		return { success: true, data: null };
	}

	const user = store.get(`users.${uid}`);

	return { success: true, data: user ?? null };
});

ipcMain.handle(IPC.AUTH.SET_LAST_ACTIVE_USER, async (_e, { uid }: { uid: string }): Promise<IpcResponse<null>> => {
	store.set('auth.lastActiveUserId', uid);
	store.set('auth.lastLoginAt', new Date().toISOString());

	return { success: true, data: null };
});

ipcMain.handle(IPC.AUTH.CLEAR_LAST_ACTIVE_USER, async (): Promise<IpcResponse<null>> => {
	store.delete('auth.lastActiveUserId');

	return { success: true, data: null };
});
