import z from 'zod';
import { ipcMain } from 'electron';
import { randomUUID } from 'node:crypto';

import { store } from '~/src/main/store';
import { ITask } from '~/src/shared/types/task';
import { IPC } from '~/src/shared/constants/ipc';
import { taskPrioritySchema } from '~/src/shared/types/task-definition';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { ICreateTaskRequest, IpcResponse } from '~/src/shared/types/ipc';
import { recurrenceEndTypeSchema, recurrenceFrequencySchema } from '~/src/shared/types/recurrence-rule';

const createTaskSchema = z.object({
	definition: z.object({
		userId: z.string().nullable().optional(),
		listId: z.string(),
		title: z.string().min(1, { message: 'Title is required' }),
		description: z.string().nullable().optional(),
		priority: taskPrioritySchema,
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

	const userId = data.definition.userId ?? randomUUID();
	const taskId = randomUUID();
	const taskDefinitionId = randomUUID();
	const recurrenceRuleId = randomUUID();
	const taskOccurrenceId = randomUUID();

	try {
		const task: ITask = {
			id: taskId,
			taskDefinition: {
				id: taskDefinitionId,
				userId,
				listId: data.definition.listId,
				title: data.definition.title,
				description: data.definition.description,
				deadline: data.definition.deadline ? data.definition.deadline.toISOString() : null,
				priority: data.definition.priority,
				isAllDay: false,
				isStarred: false,
				recurrenceRuleId,
				createdAt: new Date().toISOString(),
			},
			recurrenceRule: {
				id: recurrenceRuleId,
				frequency: data.recurrenceRule.frequency,
				endType: data.recurrenceRule.endType,
				startDateTime: data.recurrenceRule.startDateTime ? data.recurrenceRule.startDateTime.toISOString() : null,
				endDate: data.recurrenceRule.endDate ? data.recurrenceRule.endDate.toISOString() : null,
				interval: data.recurrenceRule.interval,
				weekdays: data.recurrenceRule.weekdays,
				dayOfMonth: data.recurrenceRule.dayOfMonth,
				maxOccurrences: data.recurrenceRule.maxOccurrences,
			},
			occurrences: [
				{
					id: taskOccurrenceId,
					taskDefinitionId,
					occurrenceDateTime: data.recurrenceRule.startDateTime
						? data.recurrenceRule.startDateTime.toISOString()
						: null,
					status: 'PENDING',
					createdAt: new Date().toISOString(),
				},
			],
		};

		store.set(`tasks.${task.id}`, task);

		return { success: true, data: task };
	} catch (err) {
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
