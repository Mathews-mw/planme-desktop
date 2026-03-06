import z from 'zod';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { SubtaskMapper } from '~/src/main/db/mappers/subtask-mapper';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import type { IOccurrencesByTaskQuery, IpcResponse } from '~/src/shared/types/ipc';
import { TaskOccurrenceMapper } from '~/src/main/db/mappers/task-occurrence-mapper';
import { TaskDefinitionMapper } from '~/src/main/db/mappers/task-definition-mapper';
import { RecurrenceRuleMapper } from '~/src/main/db/mappers/recurrence-rule-mapper';

const queryRequestSchema = z.object({
	taskDefinitionId: z.string(),
});

ipcMain.handle(
	IPC.OCCURRENCES.GET_MANY_BY_TASK,
	async (_event, query: IOccurrencesByTaskQuery): Promise<IpcResponse<ITaskOccurrenceDetails[]>> => {
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

		console.log('taskDefinitionId: ', taskDefinitionId);

		const db = getDb();

		const occurrences = await db.query.taskOccurrences.findMany({
			where: (fields, operators) => operators.eq(fields.taskDefinitionId, taskDefinitionId),
			orderBy: (fields, operators) => operators.desc(fields.createdAt),
			with: {
				taskDefinition: {
					with: {
						recurrenceRule: true,
						subtasks: true,
					},
				},
			},
		});

		const dataResponse: ITaskOccurrenceDetails[] = occurrences.map((occ) => {
			const occDomain = TaskOccurrenceMapper.toDomain(occ);
			const definitionDomain = TaskDefinitionMapper.toDomain(occ.taskDefinition);
			const ruleDomain = RecurrenceRuleMapper.toDomain(occ.taskDefinition.recurrenceRule);
			const subtasksDomain = occ.taskDefinition.subtasks.map(SubtaskMapper.toDomain);

			return {
				...occDomain,
				taskDefinition: {
					...definitionDomain,
					recurrenceRule: ruleDomain,
					subtasks: subtasksDomain,
				},
			};
		});

		return {
			success: true,
			data: dataResponse,
		};
	}
);
