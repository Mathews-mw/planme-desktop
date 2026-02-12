import { eq } from 'drizzle-orm';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { taskDefinitions } from '~/src/main/db/schema';
import { IpcResponse, IToggleTaskFavorite } from '~/src/shared/types/ipc';

ipcMain.handle(
	IPC.TASKS.TOGGLE_FAVORITE,
	async (_event, { taskDefinitionId }: IToggleTaskFavorite): Promise<IpcResponse<null>> => {
		const db = getDb();

		const taskDefinition = await db.query.taskDefinitions.findFirst({
			where: (fields, operators) => operators.eq(fields.id, taskDefinitionId),
		});

		if (!taskDefinition) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Task not found',
				},
			};
		}

		await db
			.update(taskDefinitions)
			.set({ isStarred: !taskDefinition.isStarred, updatedAt: new Date().toISOString() })
			.where(eq(taskDefinitions.id, taskDefinitionId));

		return { success: true, data: null };
	}
);
