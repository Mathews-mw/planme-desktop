import z from 'zod';
import { ipcMain } from 'electron';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { type ITask } from '~/src/shared/types/task';
import { TaskMapper } from '~/src/main/db/mappers/task-mapper';
import { taskPrioritySchema } from '~/src/shared/types/task-definition';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import type { IpcResponse, IUpdateTaskRequest } from '~/src/shared/types/ipc';
import { encodeWeekdays } from '~/src/shared/recurrence-engine/weekdays-bitmask';
import { TaskOccurrenceMapper } from '~/src/main/db/mappers/task-occurrence-mapper';
import { RecurrenceRuleMapper } from '~/src/main/db/mappers/recurrence-rule-mapper';
import { TaskOccurrencesPlanner } from '~/src/shared/recurrence-engine/task-occurrences-planner';
import { recurrenceEndTypeSchema, recurrenceFrequencySchema } from '~/src/shared/types/recurrence-rule';
import {
	type DrizzleRecurrenceRule,
	type DrizzleRecurrenceRuleUpdate,
	recurrenceRules,
	taskDefinitions,
	taskOccurrences,
} from '~/src/main/db/schema';

const updateTaskSchema = z.object({
	taskDefinitionId: z.string(),
	listSlug: z.string().nullable().optional(),
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	priority: taskPrioritySchema.nullable().optional(),
	isAllDay: z.coerce.boolean().optional(),
	isStarred: z.coerce.boolean().optional(),
	deadline: z.coerce.date().nullable().optional(),
	recurrenceRule: z
		.object({
			frequency: recurrenceFrequencySchema.nullable().optional(),
			endType: recurrenceEndTypeSchema.nullable().optional(),
			startDateTime: z.coerce.date().nullable().optional(),
			endDate: z.coerce.date().nullable().optional(),
			interval: z.coerce.number().nullable().optional(),
			weekdays: z.array(z.coerce.number()).nullable().optional(),
			dayOfMonth: z.coerce.number().nullable().optional(),
			maxOccurrences: z.coerce.number().optional(),
		})
		.nullable()
		.optional(),
});

type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

ipcMain.handle(IPC.TASKS.UPDATE, async (_event, raw: IUpdateTaskRequest): Promise<IpcResponse<ITask>> => {
	console.log('Update task IPC Data: ', raw);

	const parse = updateTaskSchema.safeParse(raw);

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

		const taskDefinition = await db.query.taskDefinitions.findFirst({
			where: (fields, operators) => operators.eq(fields.id, data.taskDefinitionId),
		});

		if (!taskDefinition) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Task not found',
				},
			};
		}

		let recurrenceRule = await db.query.recurrenceRules.findFirst({
			where: (fields, operators) => operators.eq(fields.id, taskDefinition.recurrenceRuleId),
		});

		const subtasks = await db.query.subtasks.findMany({
			where: (fields, operators) => operators.eq(fields.taskDefinitionId, data.taskDefinitionId),
		});

		const occurrence = await db.query.taskOccurrences.findFirst({
			where: (fields, operators) =>
				operators.and(
					operators.eq(fields.taskDefinitionId, data.taskDefinitionId),
					operators.eq(fields.status, 'PENDING')
				),
		});

		if (!recurrenceRule) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Recurrence rule not found',
				},
			};
		}

		taskDefinition.title = data.title ?? taskDefinition.title;
		taskDefinition.description = data.description ?? taskDefinition.description;
		taskDefinition.deadline = data.deadline ? data.deadline.toISOString() : taskDefinition.deadline;
		taskDefinition.priority = data.priority ?? taskDefinition.priority;
		taskDefinition.isAllDay = data.isAllDay ?? taskDefinition.isAllDay;
		taskDefinition.isStarred = data.isStarred ?? taskDefinition.isStarred;
		taskDefinition.listSlug = data.listSlug ?? taskDefinition.listSlug;
		taskDefinition.updatedAt = new Date().toISOString();

		const willUpdateRecurrence = !!data.recurrenceRule;

		const needsRecalculateOccurrences =
			(data.title !== undefined && data.title !== taskDefinition.title) ||
			(data.description !== undefined && data.description !== taskDefinition.description) ||
			(willUpdateRecurrence &&
				(data.recurrenceRule!.frequency !== recurrenceRule.frequency ||
					data.recurrenceRule!.endType !== recurrenceRule.endType ||
					(data.recurrenceRule!.startDateTime ?? null) !== (recurrenceRule.startDateTime ?? null) ||
					(data.recurrenceRule!.interval ?? null) !== (recurrenceRule.interval ?? null) ||
					(data.recurrenceRule!.weekdays ?? null) !== (recurrenceRule.weekdaysBitmask ?? null) ||
					(data.recurrenceRule!.dayOfMonth ?? null) !== (recurrenceRule.dayOfMonth ?? null) ||
					(data.recurrenceRule!.endDate ?? null) !== (recurrenceRule.endDate ?? null) ||
					(data.recurrenceRule!.maxOccurrences ?? null) !== (recurrenceRule.maxOccurrences ?? null)));

		await db.update(taskDefinitions).set(taskDefinition).where(eq(taskDefinitions.id, taskDefinition.id));

		let updatedRecurrenceForPlanning: DrizzleRecurrenceRule | null = null;

		if (willUpdateRecurrence) {
			const normalizedRecurrence = normalizeRecurrencePatch({
				current: recurrenceRule,
				patch: data.recurrenceRule!,
			});

			await db.update(recurrenceRules).set(normalizedRecurrence).where(eq(recurrenceRules.id, recurrenceRule.id));

			updatedRecurrenceForPlanning = { ...recurrenceRule, ...normalizedRecurrence } as DrizzleRecurrenceRule;
		}

		const recurrenceToUse = updatedRecurrenceForPlanning ?? recurrenceRule;

		const task: ITask = TaskMapper.toDomain({
			recurrenceRule: recurrenceToUse,
			taskDefinition,
			occurrences: occurrence ? [occurrence] : [],
			subtasks,
		});

		if (needsRecalculateOccurrences) {
			console.log('Needs Recalculate Occurrences!!!');

			await db
				.delete(taskOccurrences)
				.where(and(eq(taskOccurrences.taskDefinitionId, taskDefinition.id), eq(taskOccurrences.status, 'PENDING')));

			const now = new Date();
			const recurrenceRuleDomain = RecurrenceRuleMapper.toDomain(recurrenceToUse);

			const generateOccurrences = TaskOccurrencesPlanner.generateInitialOccurrences({
				rule: recurrenceRuleDomain,
				fromDate: now,
				untilDate: taskDefinition.deadline ? new Date(taskDefinition.deadline) : undefined,
				horizonDays: 365,
				limit: 1,
			});

			if (generateOccurrences.length > 0) {
				const firstOccurrenceDay = generateOccurrences[0];
				const taskOccurrenceId = randomUUID();

				const [newOccurrence] = await db
					.insert(taskOccurrences)
					.values({
						id: taskOccurrenceId,
						taskDefinitionId: taskDefinition.id,
						occurrenceDateTime: firstOccurrenceDay.toISOString(),
						status: 'PENDING',
					})
					.returning();

				task.occurrences = [TaskOccurrenceMapper.toDomain(newOccurrence)];
			}

			if (recurrenceToUse.frequency === 'NONE' && recurrenceToUse.endType === 'ONCE') {
				const taskOccurrenceId = randomUUID();

				const [newOccurrence] = await db
					.insert(taskOccurrences)
					.values({
						id: taskOccurrenceId,
						taskDefinitionId: taskDefinition.id,
						occurrenceDateTime: recurrenceToUse.startDateTime,
						status: 'PENDING',
					})
					.returning();

				task.occurrences = [TaskOccurrenceMapper.toDomain(newOccurrence)];
			}
		}

		return { success: true, data: task };
	} catch (err) {
		console.log('Internal error: ', err);
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while editing the task',
				details: err,
			},
		};
	}
});

function normalizeRecurrencePatch({
	current,
	patch,
}: {
	current: DrizzleRecurrenceRule;
	patch: NonNullable<UpdateTaskInput['recurrenceRule']>;
}): DrizzleRecurrenceRuleUpdate {
	let base: DrizzleRecurrenceRuleUpdate = {
		...current,
		frequency: patch.frequency ?? current.frequency,
		endType: patch.endType ?? current.endType,
		startDateTime:
			patch.frequency === 'NONE'
				? null
				: patch.startDateTime
					? patch.startDateTime.toISOString()
					: current.startDateTime,
		endDate: patch.endType === 'ON_DATE' ? (patch.endDate ? patch.endDate.toISOString() : null) : current.endDate,
		maxOccurrences: patch.endType === 'AFTER_OCCURRENCES' ? (patch.maxOccurrences ?? null) : null,
		updatedAt: new Date().toISOString(),
	};

	switch (patch.frequency) {
		case 'WEEKLY_DAYS':
			base = {
				...base,
				interval: null,
				weekdaysBitmask: patch.weekdays ? encodeWeekdays(patch.weekdays) : null,
				dayOfMonth: null,
			};
			break;

		case 'MONTHLY_DAY_OF_MONTH':
			base = {
				...base,
				interval: null,
				dayOfMonth: patch.dayOfMonth ?? null,
				weekdaysBitmask: null,
			};
			break;

		case 'DAILY_INTERVAL':
		case 'YEARLY_INTERVAL':
			base = {
				...base,
				interval: patch.endType !== 'AFTER_OCCURRENCES' ? null : (patch.interval ?? 1),
				weekdaysBitmask: null,
				dayOfMonth: null,
			};
			break;

		case 'NONE':
			base = {
				...base,
				endType: 'ONCE',
				interval: null,
				weekdaysBitmask: null,
				dayOfMonth: null,
			};
			break;
	}

	return base;
}
