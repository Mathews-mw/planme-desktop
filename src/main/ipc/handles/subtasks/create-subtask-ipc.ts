import z from 'zod';
import { ipcMain } from 'electron';
import { randomUUID } from 'node:crypto';

import { getDb } from '~/src/main/db';
import { subtasks } from '~/src/main/db/schema';
import { IPC } from '~/src/shared/constants/ipc';
import { ISubtask } from '~/src/shared/types/subtask';
import { SubtaskMapper } from '~/src/main/db/mappers/subtask-mapper';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { ICreateSubtaskRequest, IpcResponse } from '~/src/shared/types/ipc';

const createTaskSchema = z.object({
	taskDefinitionId: z.string(),
	title: z.string().min(1, { message: 'Title is required' }),
	description: z.string().nullable().optional(),
	position: z.coerce.number().nullable().optional(),
});

ipcMain.handle(IPC.SUBTASKS.CREATE, async (_event, raw: ICreateSubtaskRequest): Promise<IpcResponse<ISubtask>> => {
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

		const taskDefinition = await db.query.taskDefinitions.findFirst({
			where: (fields, operators) => operators.eq(fields.id, data.taskDefinitionId),
		});

		if (!taskDefinition) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Task definition  not found.',
				},
			};
		}

		const existingSubtasks = await db.query.subtasks.findMany({
			where: (fields, operators) => operators.eq(fields.taskDefinitionId, data.taskDefinitionId),
		});

		// Normaliza posições atuais (0..N-1)
		existingSubtasks.sort((a, b) => a.position - b.position);

		existingSubtasks.forEach((s, index) => {
			if (s.position !== index) {
				s.position = index;
			}
		});

		let newPosition: number;

		if (data.position == null || data.position == undefined) {
			newPosition = existingSubtasks.length;
		} else {
			const maxIndex = existingSubtasks.length;
			newPosition = Math.max(0, Math.min(data.position, maxIndex));

			for (const subtask of existingSubtasks) {
				if (subtask.position >= newPosition) {
					subtask.position = subtask.position + 1;
				}
			}
		}

		const subtaskId = randomUUID();

		const [subtask] = await db
			.insert(subtasks)
			.values({
				id: subtaskId,
				taskDefinitionId: taskDefinition.id,
				title: data.title,
				description: data.description ?? null,
				position: newPosition,
				createdAt: new Date().toISOString(),
			})
			.returning();

		const subtaskDomain = SubtaskMapper.toDomain(subtask);

		return { success: true, data: subtaskDomain };
	} catch (err) {
		console.log('Internal error: ', err);
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while creating the subtask',
				details: err,
			},
		};
	}
});
