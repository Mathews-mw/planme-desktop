import { and, eq } from 'drizzle-orm';
import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { ITask } from '~/src/shared/types/task';
import { IPC } from '~/src/shared/constants/ipc';
import { TaskMapper } from '~/src/main/db/mappers/task-mapper';
import { IDeleteTaskRequest, IpcResponse } from '~/src/shared/types/ipc';
import { recurrenceRules, subtasks, taskDefinitions, taskOccurrences } from '~/src/main/db/schema';
import { taskNotificationScheduler } from '../../notifications/task-notification-scheduler-factory';

ipcMain.handle(
	IPC.TASKS.DELETE,
	async (_event, { taskDefinitionId }: IDeleteTaskRequest): Promise<IpcResponse<ITask>> => {
		try {
			const db = getDb();

			const taskDefinition = await db.query.taskDefinitions.findFirst({
				where: (fields, operators) => operators.eq(fields.id, taskDefinitionId),
				with: {
					recurrenceRule: true,
					occurrences: {
						where: (fields, operators) => operators.eq(fields.status, 'PENDING'),
					},
					subtasks: true,
				},
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

			if (taskDefinition.subtasks && taskDefinition.subtasks.length > 0) {
				await db.delete(subtasks).where(eq(subtasks.taskDefinitionId, taskDefinitionId));
			}

			if (taskDefinition.occurrences && taskDefinition.occurrences.length > 0) {
				await db
					.delete(taskOccurrences)
					.where(and(eq(taskOccurrences.taskDefinitionId, taskDefinitionId), eq(taskOccurrences.status, 'PENDING')));
			}

			await db.delete(taskDefinitions).where(eq(taskDefinitions.id, taskDefinitionId));
			await db.delete(recurrenceRules).where(eq(recurrenceRules.id, taskDefinition.recurrenceRuleId));

			const taskReference = TaskMapper.toDomain({
				taskDefinition: taskDefinition,
				recurrenceRule: taskDefinition.recurrenceRule,
				occurrences: taskDefinition.occurrences,
				subtasks: taskDefinition.subtasks,
			});

			void taskNotificationScheduler.syncTaskDefinition(taskDefinitionId).catch((err) => {
				console.error('Scheduler sync failed:', err);
			});

			return { success: true, data: taskReference };
		} catch (err) {
			console.log('Internal error: ', err);
			return {
				success: false,
				error: {
					code: 'INTERNAL_ERROR',
					message: 'An error occurred while deleting the task',
					details: err,
				},
			};
		}
	}
);
