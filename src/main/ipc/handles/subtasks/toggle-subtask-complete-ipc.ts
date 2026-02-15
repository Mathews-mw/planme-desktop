import z from 'zod';
import { eq } from 'drizzle-orm';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { subtasks } from '~/src/main/db/schema';
import { IPC } from '~/src/shared/constants/ipc';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { IpcResponse, IToggleCompleteSubtaskRequest } from '~/src/shared/types/ipc';

const createTaskSchema = z.object({
	subtaskId: z.string(),
});

ipcMain.handle(
	IPC.SUBTASKS.TOGGLE_COMPLETE,
	async (_event, raw: IToggleCompleteSubtaskRequest): Promise<IpcResponse<null>> => {
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

		const { subtaskId } = parse.data;

		try {
			const db = getDb();

			const subtask = await db.query.subtasks.findFirst({
				where: (fields, operators) => operators.eq(fields.id, subtaskId),
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

			if (!subtask.isCompleted) {
				subtask.isCompleted = true;
				subtask.completedAt = new Date().toISOString();
			} else {
				subtask.isCompleted = false;
				subtask.completedAt = null;
			}

			await db.update(subtasks).set(subtask).where(eq(subtasks.id, subtaskId));

			return { success: true, data: null };
		} catch (err) {
			console.log('Internal error: ', err);
			return {
				success: false,
				error: {
					code: 'INTERNAL_ERROR',
					message: 'An error occurred while toggling the subtask complete status',
					details: err,
				},
			};
		}
	}
);
