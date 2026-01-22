import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { store } from '~/src/main/store';
import { IPC } from '~/src/shared/constants/ipc';
import { IpcResponse } from '~/src/shared/types/ipc';
import { IUserDetails } from '~/src/shared/types/user';
import { UserDetailsMapper } from '~/src/main/db/mappers/user-mapper';

const db = getDb();

ipcMain.handle(IPC.AUTH.GET_LAST_ACTIVE_USER, async (): Promise<IpcResponse<IUserDetails | null>> => {
	const uid = store.get('auth.lastActiveUserId');

	if (!uid) {
		return { success: true, data: null };
	}

	const user = await db.query.users.findFirst({
		with: { accounts: true },
		where: (fields, operators) => operators.eq(fields.id, uid),
	});

	if (!user) {
		return { success: true, data: null };
	}

	const userDomain = UserDetailsMapper.toDomain({ user: user, accounts: user.accounts });

	return { success: true, data: userDomain };
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
