import z from 'zod';
import { eq } from 'drizzle-orm';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { subtasks } from '~/src/main/db/schema';
import { IPC } from '~/src/shared/constants/ipc';
import { ISubtask } from '~/src/shared/types/subtask';
import { SubtaskMapper } from '~/src/main/db/mappers/subtask-mapper';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { IpcResponse, IUpdateSubtaskRequest } from '~/src/shared/types/ipc';

const createTaskSchema = z.object({
	subtaskId: z.string(),
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
});

ipcMain.handle(IPC.SUBTASKS.UPDATE, async (_event, raw: IUpdateSubtaskRequest): Promise<IpcResponse<ISubtask>> => {
	const parse = createTaskSchema.safeParse(raw);

	if (!parse.success) {
		const fieldErrors = zodErrorHandler(parse.error);

		return {
			success: false,
			error: {
				code: 'VALIDATION_ERROR',
				message: 'Invalid subtask data',
				fieldErrors,
			},
		};
	}

	const data = parse.data;

	try {
		const db = getDb();

		const subtask = await db.query.subtasks.findFirst({
			where: (fields, operators) => operators.eq(fields.id, data.subtaskId),
		});

		if (!subtask) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Subtask not found.',
				},
			};
		}

		subtask.title = data.title ?? subtask.title;
		subtask.description = data.description ?? subtask.description;
		subtask.updatedAt = new Date().toISOString();

		await db.update(subtasks).set(subtask).where(eq(subtasks.id, data.subtaskId));

		const subtaskDomain = SubtaskMapper.toDomain(subtask);

		return { success: true, data: subtaskDomain };
	} catch (err) {
		console.log('Internal error: ', err);
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while editing the subtask',
				details: err,
			},
		};
	}
});
