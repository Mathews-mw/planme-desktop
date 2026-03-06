import z from 'zod';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { TaskDefinitionMapper } from '~/src/main/db/mappers/task-definition-mapper';
import type { IpcResponse, ITaskCursorBasedQuery, ITaskCursorBasedResponse } from '~/src/shared/types/ipc';

const queryRequestSchema = z.object({
	cursor: z.optional(z.string()),
	limit: z.coerce.number().optional().default(10),
	search: z.string().nullable().optional(),
});

ipcMain.handle(
	IPC.TASKS.FETCH_ALL_CURSOR,
	async (_event, query: ITaskCursorBasedQuery): Promise<IpcResponse<ITaskCursorBasedResponse>> => {
		console.log('query params cursor based: ', query);
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

		const { cursor, limit, search } = parse.data;

		const db = getDb();

		const tasksDefinitions = await db.query.taskDefinitions.findMany({
			where: (fields, operators) => {
				const conditions = [];

				if (cursor) {
					conditions.push(operators.lt(fields.createdAt, cursor));
				}

				return conditions.length ? operators.and(...conditions) : undefined;
			},
			limit: limit + 1,
			orderBy: (fields, operators) => {
				return operators.desc(fields.createdAt);
			},
		});

		let nextCursor: string | undefined;
		let previousCursor: string | undefined;
		let hasMore = true;

		if (tasksDefinitions.length > limit) {
			hasMore = true;
			previousCursor = tasksDefinitions[0].createdAt;

			const nextItem = tasksDefinitions.pop();
			nextCursor = nextItem?.createdAt;
		} else {
			hasMore = false;
		}

		const tasksDefinitionsResponse = tasksDefinitions.map(TaskDefinitionMapper.toDomain);

		return {
			success: true,
			data: {
				nextCursor,
				previousCursor,
				hasMore,
				tasks: tasksDefinitionsResponse,
			},
		};
	}
);
