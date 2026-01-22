import { ipcMain } from 'electron';

import { getDb } from '~/src/main/db';
import { ITask } from '~/src/shared/types/task';
import { IPC } from '~/src/shared/constants/ipc';
import { TaskMapper } from '~/src/main/db/mappers/task-mapper';

ipcMain.handle(IPC.TASKS.FETCH_ALL, async (): Promise<{ data: ITask[] }> => {
	const db = getDb();

	const tasks = await db.query.taskDefinitions.findMany({
		with: {
			recurrenceRule: true,
			occurrences: true,
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
		data: domainTasks,
	};
});
