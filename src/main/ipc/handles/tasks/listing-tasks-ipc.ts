import z from 'zod';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { ITask } from '~/src/shared/types/task';
import { IPC } from '~/src/shared/constants/ipc';
import { TaskMapper } from '~/src/main/db/mappers/task-mapper';
import { IpcResponse, ITaskQuery } from '~/src/shared/types/ipc';
import { taskStatusSchema } from '~/src/shared/types/task-occurrence';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { taskOccurrences } from '~/src/main/db/schema';
import { and, eq } from 'drizzle-orm';

const queryRequestSchema = z.object({
	search: z.string().nullable().optional(),
	status: z.optional(taskStatusSchema.nullable()),
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

	const { search, status } = parse.data;

	console.log('search: ', search);
	console.log('status: ', status);

	const db = getDb();

	const tasks = await db.query.taskDefinitions.findMany({
		// where: search
		// 	? (fields, operators) =>
		// 			operators.like(operators.sql`lower(${fields.title})`, `%${search?.trim().toLowerCase()}%`)
		// 	: undefined,
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

			return conditions.length ? operators.and(...conditions) : undefined;
		},
		with: {
			recurrenceRule: true,
			occurrences: status
				? {
						where: (fields, operators) => operators.eq(fields.status, status),
					}
				: true,
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
