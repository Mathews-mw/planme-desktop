import z from 'zod';
import { ipcMain } from 'electron';
import { randomUUID } from 'node:crypto';

import { getDb } from '~/src/main/db';
import { ITask } from '~/src/shared/types/task';
import { IPC } from '~/src/shared/constants/ipc';
import { TaskMapper } from '~/src/main/db/mappers/task-mapper';
import { taskPrioritySchema } from '~/src/shared/types/task-definition';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { ICreateTaskRequest, IpcResponse } from '~/src/shared/types/ipc';
import { encodeWeekdays } from '~/src/shared/recurrence-engine/weekdays-bitmask';
import { TaskOccurrenceMapper } from '~/src/main/db/mappers/task-occurrence-mapper';
import { RecurrenceRuleMapper } from '~/src/main/db/mappers/recurrence-rule-mapper';
import { recurrenceRules, taskDefinitions, taskOccurrences } from '~/src/main/db/schema';
import { TaskOccurrencesPlanner } from '~/src/shared/recurrence-engine/task-occurrences-planner';
import { recurrenceEndTypeSchema, recurrenceFrequencySchema } from '~/src/shared/types/recurrence-rule';

const createTaskSchema = z.object({
	definition: z.object({
		userId: z.string(),
		listSlug: z.string(),
		title: z.string().min(1, { message: 'Title is required' }),
		description: z.string().nullable().optional(),
		priority: taskPrioritySchema,
		isAllDay: z.coerce.boolean().optional().default(false),
		isStarred: z.coerce.boolean().optional().default(false),
		deadline: z.coerce.date().nullable().optional(),
	}),
	recurrenceRule: z.object({
		frequency: z.optional(recurrenceFrequencySchema).default('NONE'),
		endType: z.optional(recurrenceEndTypeSchema).default('ONCE'),
		startDateTime: z.coerce.date().nullable().optional(),
		endDate: z.coerce.date().nullable().optional(),
		interval: z.coerce.number().nullable().optional(),
		weekdays: z.array(z.coerce.number()).nullable().optional(),
		dayOfMonth: z.coerce.number().nullable().optional(),
		maxOccurrences: z.coerce.number().optional().default(1),
	}),
});

ipcMain.handle(IPC.TASKS.CREATE, async (_event, raw: ICreateTaskRequest): Promise<IpcResponse<ITask>> => {
	const parse = createTaskSchema.safeParse(raw);

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

	const data = parse.data;

	try {
		const db = getDb();

		const userId = data.definition.userId;
		const taskDefinitionId = randomUUID();
		const recurrenceRuleId = randomUUID();
		const taskOccurrenceId = randomUUID();

		const [recurrenceRule] = await db
			.insert(recurrenceRules)
			.values({
				id: recurrenceRuleId,
				frequency: data.recurrenceRule.frequency,
				endType: data.recurrenceRule.endType,
				startDateTime: data.recurrenceRule.startDateTime ? data.recurrenceRule.startDateTime.toISOString() : null,
				endDate: data.recurrenceRule.endDate ? data.recurrenceRule.endDate.toISOString() : null,
				interval: data.recurrenceRule.interval ?? null,
				weekdaysBitmask: data.recurrenceRule.weekdays ? encodeWeekdays(data.recurrenceRule.weekdays) : null,
				dayOfMonth: data.recurrenceRule.dayOfMonth ?? null,
				maxOccurrences: data.recurrenceRule.maxOccurrences ?? null,
			})
			.returning();

		const [taskDefinition] = await db
			.insert(taskDefinitions)
			.values({
				id: taskDefinitionId,
				userId,
				listSlug: data.definition.listSlug,
				title: data.definition.title,
				description: data.definition.description ?? null,
				deadline: data.definition.deadline ? data.definition.deadline.toISOString() : null,
				priority: data.definition.priority,
				isAllDay: data.definition.isAllDay,
				isStarred: data.definition.isStarred,
				recurrenceRuleId,
			})
			.returning();

		const now = new Date();
		const recurrenceRuleDomain = RecurrenceRuleMapper.toDomain(recurrenceRule);

		const generateOccurrences = TaskOccurrencesPlanner.generateInitialOccurrences({
			rule: recurrenceRuleDomain,
			fromDate: now,
			horizonDays: 365,
			limit: 1,
		});

		const task = TaskMapper.toDomain({
			recurrenceRule,
			taskDefinition,
			occurrences: [],
		});

		if (generateOccurrences.length > 0) {
			const firstOccurrenceDay = generateOccurrences[0];

			const [taskOccurrence] = await db
				.insert(taskOccurrences)
				.values({
					id: taskOccurrenceId,
					taskDefinitionId: taskDefinitionId,
					occurrenceDateTime: firstOccurrenceDay.toISOString(),
					status: 'PENDING',
				})
				.returning();

			task.occurrences = [TaskOccurrenceMapper.toDomain(taskOccurrence)];
		}

		return { success: true, data: task };
	} catch (err) {
		console.log('Internal error: ', err);
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while creating the task',
				details: err,
			},
		};
	}
});
