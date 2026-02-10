import z from 'zod';
import { ipcMain } from 'electron';
import { desc, eq } from 'drizzle-orm';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { SubtaskMapper } from '~/src/main/db/mappers/subtask-mapper';
import { taskDefinitions, taskOccurrences } from '~/src/main/db/schema';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { type IOccurrencesQuery, type IpcResponse } from '~/src/shared/types/ipc';
import { TaskOccurrenceMapper } from '~/src/main/db/mappers/task-occurrence-mapper';
import { TaskDefinitionMapper } from '~/src/main/db/mappers/task-definition-mapper';
import { RecurrenceRuleMapper } from '~/src/main/db/mappers/recurrence-rule-mapper';
import { type ITaskOccurrenceDetails, taskStatusSchema } from '~/src/shared/types/task-occurrence';

const queryRequestSchema = z.object({
	search: z.string().nullable().optional(),
	status: z.optional(taskStatusSchema.nullable()),
	orderBy: z
		.union([z.literal('latest'), z.literal('oldest'), z.literal('recently_updated'), z.literal('recently_completed')])
		.optional()
		.default('latest'),
});

ipcMain.handle(
	IPC.OCCURRENCES.FETCH_ALL,
	async (_event, query: IOccurrencesQuery): Promise<IpcResponse<ITaskOccurrenceDetails[]>> => {
		console.log('query params: ', query);
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

		const { search, status, orderBy } = parse.data;

		const db = getDb();

		const occurrences = await db.query.taskOccurrences.findMany({
			where: (fields, operators) => {
				const conditions = [];

				if (search?.trim()) {
					conditions.push(
						operators.exists(
							db
								.select()
								.from(taskDefinitions)
								.where(
									operators.like(operators.sql`lower(${taskDefinitions.title})`, `%${search?.trim().toLowerCase()}%`)
								)
						)
					);
				}

				if (status) {
					conditions.push(
						operators.exists(
							db
								.select()
								.from(taskOccurrences)
								.where(eq(fields.status, status))
								.orderBy(desc(taskOccurrences.createdAt))
						)
					);
				}

				return conditions.length ? operators.and(...conditions) : undefined;
			},
			orderBy: (fields, operators) => {
				switch (orderBy) {
					case 'latest':
						return operators.desc(fields.createdAt);
					case 'oldest':
						return operators.asc(fields.createdAt);
					case 'recently_updated':
						return operators.desc(fields.updatedAt);
					case 'recently_completed':
						return operators.desc(fields.completedAt);
					default:
						return operators.desc(fields.createdAt);
				}
			},
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
