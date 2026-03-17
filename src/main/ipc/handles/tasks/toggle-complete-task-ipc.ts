import z from 'zod';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { ipcMain } from 'electron';
import { randomUUID } from 'node:crypto';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { taskOccurrences } from '~/src/main/db/schema';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { IpcResponse, IToggleTaskComplete } from '~/src/shared/types/ipc';
import { RecurrenceRuleMapper } from '~/src/main/db/mappers/recurrence-rule-mapper';
import { TaskOccurrencesPlanner } from '~/src/shared/recurrence-engine/task-occurrences-planner';
import { taskNotificationScheduler } from '../../notifications/task-notification-scheduler-factory';

const requestSchema = z.object({
	occurrenceId: z.string(),
	taskDefinitionId: z.string(),
});

ipcMain.handle(IPC.TASKS.TOGGLE_COMPLETE, async (_event, raw: IToggleTaskComplete): Promise<IpcResponse<null>> => {
	const parse = requestSchema.safeParse(raw);

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

	const { occurrenceId, taskDefinitionId } = parse.data;
	const db = getDb();

	try {
		const taskDefinition = await db.query.taskDefinitions.findFirst({
			where: (fields, operators) => operators.eq(fields.id, taskDefinitionId),
		});

		const taskOccurrence = await db.query.taskOccurrences.findFirst({
			where: (fields, operators) => operators.eq(fields.id, occurrenceId),
			orderBy: (fields, operators) => operators.desc(fields.createdAt),
		});

		if (!taskDefinition || !taskOccurrence) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Task definition or occurrence not found.',
				},
			};
		}

		const recurrenceRule = await db.query.recurrenceRules.findFirst({
			where: (fields, operators) => operators.eq(fields.id, taskDefinition.recurrenceRuleId),
		});

		if (!recurrenceRule) {
			return {
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Recurrence rule not found.',
				},
			};
		}

		if (taskOccurrence.status === 'COMPLETED' && taskOccurrence.completedAt) {
			taskOccurrence.status = 'PENDING';
			taskOccurrence.completedAt = null;
			taskOccurrence.updatedAt = new Date().toISOString();
		} else {
			taskOccurrence.status = 'COMPLETED';
			taskOccurrence.completedAt = new Date().toISOString();
			taskOccurrence.updatedAt = new Date().toISOString();
		}

		// ==> Update current occurrence status status
		await db.update(taskOccurrences).set(taskOccurrence).where(eq(taskOccurrences.id, taskOccurrence.id)).returning();

		// ==> Calculates the date of the new occurrence, if necessary.
		const existingPendingOccurrences = await db.query.taskOccurrences.findMany({
			where: (fields, operators) =>
				operators.and(operators.eq(fields.taskDefinitionId, taskDefinition.id), eq(fields.status, 'PENDING')),
		});

		console.log('existingPendingOccurrences: ', existingPendingOccurrences);

		const anyFutureOccurrences = existingPendingOccurrences.some((occ) => dayjs(occ.occurrenceDateTime).isAfter());
		console.log('anyFutureOccurrences: ', anyFutureOccurrences);

		if (!anyFutureOccurrences) {
			console.log('should create new occurrence');

			const generateOccurrences = TaskOccurrencesPlanner.generateInitialOccurrences({
				rule: RecurrenceRuleMapper.toDomain(recurrenceRule),
				fromDate: taskOccurrence.occurrenceDateTime ? new Date(taskOccurrence.occurrenceDateTime) : new Date(),
				horizonDays: 365,
				limit: 1,
			});

			console.log('new occurrences dates: ', generateOccurrences);

			if (generateOccurrences.length > 0) {
				const firstOccurrenceDay = generateOccurrences[0];
				console.log('firstOccurrenceDay: ', firstOccurrenceDay);

				await db.insert(taskOccurrences).values({
					id: randomUUID(),
					taskDefinitionId: taskDefinition.id,
					occurrenceDateTime: firstOccurrenceDay.toISOString(),
					status: 'PENDING',
				});
			}
		}

		void taskNotificationScheduler.syncTaskDefinition(taskDefinition.id).catch((err) => {
			console.error('Scheduler sync failed:', err);
		});

		return { success: true, data: null };
	} catch (error) {
		console.log('Internal error: ', error);
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while toggle task complete',
				details: error,
			},
		};
	}
});
