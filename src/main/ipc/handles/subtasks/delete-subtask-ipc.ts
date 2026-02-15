import z from 'zod';
import { eq } from 'drizzle-orm';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { subtasks } from '~/src/main/db/schema';
import { IPC } from '~/src/shared/constants/ipc';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { IDeleteSubtaskRequest, IpcResponse } from '~/src/shared/types/ipc';

const createTaskSchema = z.object({
	subtaskId: z.string(),
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
});

ipcMain.handle(IPC.SUBTASKS.DELETE, async (_event, raw: IDeleteSubtaskRequest): Promise<IpcResponse<null>> => {
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

		await db.delete(subtasks).where(eq(subtasks.id, data.subtaskId));

		const siblings = await db.query.subtasks.findMany({
			where: (fields, operators) => operators.eq(fields.taskDefinitionId, subtask.taskDefinitionId),
		});

		const sorted = siblings.sort((a, b) => a.position - b.position);

		sorted.forEach((s, index) => {
			s.position = index;
		});

		for (const s of sorted) {
			await db.update(subtasks).set(s).where(eq(subtasks.id, s.id));
		}

		return { success: true, data: null };
	} catch (err) {
		console.log('Internal error: ', err);
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while deleting the subtask',
				details: err,
			},
		};
	}
});
