import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { IUserDetails } from '~/src/shared/types/user';
import { IGetUserRequest, IpcResponse } from '~/src/shared/types/ipc';
import { UserDetailsMapper } from '~/src/main/db/mappers/user-mapper';

ipcMain.handle(IPC.USERS.GET, async (_event, { id }: IGetUserRequest): Promise<IpcResponse<IUserDetails>> => {
	const db = getDb();

	const user = await db.query.users.findFirst({
		with: { accounts: true },
		where: (fields, operators) => operators.eq(fields.id, id),
	});

	if (!user) {
		return {
			success: false,
			error: {
				code: 'NOT_FOUND',
				message: 'User not found',
			},
		};
	}

	const userDomain = UserDetailsMapper.toDomain({ user: user, accounts: user.accounts });

	return { success: true, data: userDomain };
});
