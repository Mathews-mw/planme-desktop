import z from 'zod';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { ISubtask } from '~/src/shared/types/subtask';
import { SubtaskMapper } from '~/src/main/db/mappers/subtask-mapper';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { IListingSubtasksQuery, IpcResponse } from '~/src/shared/types/ipc';

const queryRequestSchema = z.object({
	taskDefinitionId: z.string(),
});

ipcMain.handle(
	IPC.SUBTASKS.FETCH_ALL,
	async (_event, query: IListingSubtasksQuery): Promise<IpcResponse<ISubtask[]>> => {
		const parse = queryRequestSchema.safeParse(query);

		if (!parse.success) {
			const fieldErrors = zodErrorHandler(parse.error);

			return {
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid task data',
					fieldErrors,
				},
			};
		}

		const { taskDefinitionId } = parse.data;

		const db = getDb();

		const subtasks = await db.query.subtasks.findMany({
			where: (fields, operators) => operators.eq(fields.taskDefinitionId, taskDefinitionId),
		});

		const subtasksDomain = subtasks.map(SubtaskMapper.toDomain);

		return {
			success: true,
			data: subtasksDomain,
		};
	}
);
