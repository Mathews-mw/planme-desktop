import z from 'zod';
import { eq } from 'drizzle-orm';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { subtasks as subtasksSchema } from '~/src/main/db/schema';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { IpcResponse, IReorderSubtasksRequest } from '~/src/shared/types/ipc';

const createTaskSchema = z.object({
	taskDefinitionId: z.string(),
	orderedSubtaskIds: z.array(z.string()),
});

ipcMain.handle(IPC.SUBTASKS.REORDER, async (_event, raw: IReorderSubtasksRequest): Promise<IpcResponse<null>> => {
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

	const { taskDefinitionId, orderedSubtaskIds } = parse.data;

	try {
		const db = getDb();

		const subtasks = await db.query.subtasks.findMany({
			where: (fields, operators) => operators.eq(fields.taskDefinitionId, taskDefinitionId),
		});

		if (subtasks.length === 0) {
			return { success: true, data: null };
		}

		// validar se IDs batem
		const currentIds = new Set(subtasks.map((s) => s.id.toString()));
		const orderedSet = new Set(orderedSubtaskIds.map((id) => id));

		if (currentIds.size !== orderedSet.size || [...currentIds].some((id) => !orderedSet.has(id))) {
			return {
				success: false,
				error: { code: 'BAD_REQUEST_ERROR', message: 'orderedSubtaskIds must contain exactly the current subtasks' },
			};
		}

		// Aplica nova ordem
		const byId = new Map(subtasks.map((subtask) => [subtask.id.toString(), subtask]));

		orderedSubtaskIds.forEach((id, index) => {
			const subtask = byId.get(id);

			if (!subtask) return;

			subtask.position = index;
		});

		// Persistir nova ordenação
		for (const subtask of byId.values()) {
			await db.update(subtasksSchema).set(subtask).where(eq(subtasksSchema.id, subtask.id));
		}

		return { success: true, data: null };
	} catch (err) {
		console.log('Internal error: ', err);
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while reordering the subtasks',
				details: err,
			},
		};
	}
});
