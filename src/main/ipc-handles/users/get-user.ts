import { ipcMain } from 'electron';

import { store } from '~/src/main/store';
import { IPC } from '~/src/shared/constants/ipc';
import { IUser } from '~/src/shared/types/user';
import { IGetUserRequest, IpcResponse } from '~/src/shared/types/ipc';

ipcMain.handle(IPC.USERS.GET, async (_event, { id }: IGetUserRequest): Promise<IpcResponse<IUser>> => {
	const user = store.get<string, IUser>(`users.${id}`) as IUser | undefined;

	if (!user) {
		return {
			success: false,
			error: {
				code: 'NOT_FOUND',
				message: 'User not found',
			},
		};
	}

	return { success: true, data: user };
});
