import z from 'zod';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { SubtaskMapper } from '~/src/main/db/mappers/subtask-mapper';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { TaskOccurrenceMapper } from '~/src/main/db/mappers/task-occurrence-mapper';
import { TaskDefinitionMapper } from '~/src/main/db/mappers/task-definition-mapper';
import { RecurrenceRuleMapper } from '~/src/main/db/mappers/recurrence-rule-mapper';
import type {
	IOccurrencesCursorBasedQuery,
	IOccurrencesCursorBasedResponse,
	IpcResponse,
} from '~/src/shared/types/ipc';

const queryRequestSchema = z.object({
	cursor: z.optional(z.string()),
	limit: z.coerce.number().optional().default(10),
	search: z.string().nullable().optional(),
});

ipcMain.handle(
	IPC.OCCURRENCES.FETCH_ALL_CURSOR,
	async (_event, query: IOccurrencesCursorBasedQuery): Promise<IpcResponse<IOccurrencesCursorBasedResponse>> => {
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

		const occurrences = await db.query.taskOccurrences.findMany({
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
			with: {
				taskDefinition: {
					with: {
						recurrenceRule: true,
						subtasks: true,
					},
				},
			},
		});

		let nextCursor: string | undefined;
		let previousCursor: string | undefined;
		let hasMore = true;

		if (occurrences.length > limit) {
			hasMore = true;
			previousCursor = occurrences[0].createdAt;

			const nextItem = occurrences.pop();
			nextCursor = nextItem?.createdAt;
		} else {
			hasMore = false;
		}

		const occurrencesResponse: ITaskOccurrenceDetails[] = occurrences.map((occ) => {
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
			data: {
				nextCursor,
				previousCursor,
				hasMore,
				occurrences: occurrencesResponse,
			},
		};
	}
);
