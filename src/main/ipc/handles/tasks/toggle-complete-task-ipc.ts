import z from 'zod';
import { ipcMain } from 'electron';

import { eq } from 'drizzle-orm';
import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { taskOccurrences } from '~/src/main/db/schema';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { IpcResponse, IToggleTaskComplete } from '~/src/shared/types/ipc';

const requestSchema = z.object({
	taskDefinitionId: z.string(),
});

ipcMain.handle(IPC.TASKS.TOGGLE_COMPLETE, async (_event, raw: IToggleTaskComplete): Promise<IpcResponse<null>> => {
	const parse = requestSchema.safeParse(raw);

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

	try {
		console.log('update taskDefinitionId: ', taskDefinitionId);

		const taskDefinition = await db.query.taskDefinitions.findFirst({
			where: (fields, operators) => operators.eq(fields.id, taskDefinitionId),
		});

		const taskOccurrence = await db.query.taskOccurrences.findFirst({
			where: (fields, operators) => operators.and(operators.eq(fields.taskDefinitionId, taskDefinitionId)),
			orderBy: (fields, operators) => operators.desc(fields.createdAt),
		});

		if (!taskDefinition || !taskOccurrence) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Task definition or occurrence not found.',
				},
			};
		}

		const recurrenceRule = await db.query.recurrenceRules.findFirst({
			where: (fields, operators) => operators.eq(fields.id, taskDefinition.recurrenceRuleId),
		});

		if (!recurrenceRule) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Recurrence rule not found.',
				},
			};
		}

		if (taskOccurrence.status === 'COMPLETED' && taskOccurrence.completedAt) {
			taskOccurrence.status = 'PENDING';
			taskOccurrence.completedAt = null;
		} else {
			taskOccurrence.status = 'COMPLETED';
			taskOccurrence.completedAt = new Date().toISOString();

			// aqui vai ser necessário gerar uma nova ocorrência
		}

		const result = await db
			.update(taskOccurrences)
			.set(taskOccurrence)
			.where(eq(taskOccurrences.id, taskOccurrence.id))
			.returning();

		console.log('update result: ', result);

		return { success: true, data: null };
	} catch (error) {
		console.log('Internal error: ', error);
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while toggle task complete',
				details: error,
			},
		};
	}
});
