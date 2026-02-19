import z from 'zod';
import { ipcMain } from 'electron';
import { and, eq } from 'drizzle-orm';

import { getDb } from '~/src/main/db';
import { ITask } from '~/src/shared/types/task';
import { IPC } from '~/src/shared/constants/ipc';
import { TaskMapper } from '~/src/main/db/mappers/task-mapper';
import { IpcResponse, ITaskQuery } from '~/src/shared/types/ipc';
import { taskStatusSchema } from '~/src/shared/types/task-occurrence';
import { recurrenceRules, taskOccurrences } from '~/src/main/db/schema';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';

const queryRequestSchema = z.object({
	search: z.string().nullable().optional(),
	status: z.optional(taskStatusSchema.nullable()),
	overdueDateOnly: z.optional(z.coerce.boolean().default(false)),
});

ipcMain.handle(IPC.TASKS.FETCH_ALL, async (_event, query: ITaskQuery): Promise<IpcResponse<ITask[]>> => {
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

	const { search, status, overdueDateOnly } = parse.data;

	const db = getDb();

	const tasks = await db.query.taskDefinitions.findMany({
		where: (fields, operators) => {
			const conditions = [];

			if (search?.trim()) {
				conditions.push(operators.like(operators.sql`lower(${fields.title})`, `%${search?.trim().toLowerCase()}%`));
			}

			if (status) {
				conditions.push(
					operators.exists(
						db
							.select()
							.from(taskOccurrences)
							.where(and(eq(taskOccurrences.taskDefinitionId, fields.id), eq(taskOccurrences.status, status)))
					)
				);
			}

			if (overdueDateOnly) {
				conditions.push(
					operators.exists(
						db
							.select()
							.from(recurrenceRules)
							.where(and(eq(recurrenceRules.frequency, 'NONE'), eq(recurrenceRules.endType, 'ONCE')))
					)
				);
			}

			return conditions.length ? operators.and(...conditions) : undefined;
		},
		with: {
			recurrenceRule: true,
			occurrences: status
				? {
						where: (fields, operators) => operators.eq(fields.status, status),
						orderBy: (fields, operators) => operators.desc(fields.createdAt),
					}
				: { orderBy: (fields, operators) => operators.desc(fields.createdAt) },
			subtasks: true,
		},
	});

	const domainTasks = tasks.map((task) =>
		TaskMapper.toDomain({
			taskDefinition: task,
			recurrenceRule: task.recurrenceRule,
			occurrences: task.occurrences,
			subtasks: task.subtasks,
		})
	);

	return {
		success: true,
		data: domainTasks,
	};
});
