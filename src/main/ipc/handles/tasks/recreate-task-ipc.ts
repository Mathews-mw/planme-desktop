import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { ITask } from '~/src/shared/types/task';
import { IPC } from '~/src/shared/constants/ipc';
import { SubtaskMapper } from '~/src/main/db/mappers/subtask-mapper';
import { IpcResponse, IRecreateTaskRequest } from '~/src/shared/types/ipc';
import { encodeWeekdays } from '~/src/shared/recurrence-engine/weekdays-bitmask';
import { TaskOccurrenceMapper } from '~/src/main/db/mappers/task-occurrence-mapper';
import { recurrenceRules, subtasks, taskDefinitions, taskOccurrences } from '~/src/main/db/schema';

ipcMain.handle(IPC.TASKS.RECREATE, async (_event, raw: IRecreateTaskRequest): Promise<IpcResponse<ITask>> => {
	const data = raw;

	try {
		const db = getDb();

		const userId = data.task.taskDefinition.userId;

		const [recurrenceRule] = await db
			.insert(recurrenceRules)
			.values({
				id: data.task.recurrenceRule.id,
				frequency: data.task.recurrenceRule.frequency,
				endType: data.task.recurrenceRule.endType,
				startDateTime: data.task.recurrenceRule.startDateTime
					? data.task.recurrenceRule.startDateTime.toISOString()
					: null,
				endDate: data.task.recurrenceRule.endDate ? data.task.recurrenceRule.endDate.toISOString() : null,
				interval: data.task.recurrenceRule.interval ?? null,
				weekdaysBitmask: data.task.recurrenceRule.weekdays ? encodeWeekdays(data.task.recurrenceRule.weekdays) : null,
				dayOfMonth: data.task.recurrenceRule.dayOfMonth ?? null,
				maxOccurrences: data.task.recurrenceRule.maxOccurrences ?? null,
			})
			.returning();

		await db
			.insert(taskDefinitions)
			.values({
				id: data.task.taskDefinition.id,
				userId,
				recurrenceRuleId: recurrenceRule.id,
				listSlug: data.task.taskDefinition.listSlug,
				title: data.task.taskDefinition.title,
				description: data.task.taskDefinition.description ?? null,
				deadline: data.task.taskDefinition.deadline ? data.task.taskDefinition.deadline.toISOString() : null,
				priority: data.task.taskDefinition.priority,
				isAllDay: data.task.taskDefinition.isAllDay,
				isStarred: data.task.taskDefinition.isStarred,
			})
			.returning();

		const occurrencesDb = data.task.occurrences.map(TaskOccurrenceMapper.toDrizzle);
		const subtasksDb = data.task.subtasks ? data.task.subtasks.map(SubtaskMapper.toDrizzle) : [];

		if (occurrencesDb.length > 0) {
			await db.insert(taskOccurrences).values(occurrencesDb);
		}

		if (subtasksDb.length > 0) {
			await db.insert(subtasks).values(subtasksDb);
		}

		return { success: true, data: data.task };
	} catch (err) {
		console.log('Internal error: ', err);
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while recreating the task',
				details: err,
			},
		};
	}
});
