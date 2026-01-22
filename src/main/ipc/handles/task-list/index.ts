import { ipcMain } from 'electron';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { getDb } from '~/src/main/db';
import { taskList } from '~/src/main/db/schema';
import { IPC } from '~/src/shared/constants/ipc';
import { ITaskList } from '~/src/shared/types/task';
import { generateSlug } from '~/src/utils/generate-slug';
import { TaskListMapper } from '~/src/main/db/mappers/task-list-mapper';
import { IpcResponse, ISaveTaskListRequest } from '~/src/shared/types/ipc';

const db = getDb();

ipcMain.handle(IPC.TASK_LIST.FETCH_ALL, async (): Promise<{ data: ITaskList[] }> => {
	const taskLists = await db.select().from(taskList);

	const taskListsDomain = taskLists.map(TaskListMapper.toDomain);

	return {
		data: taskListsDomain,
	};
});

ipcMain.handle(
	IPC.TASK_LIST.GET_BY_SLUG,
	async (_event, { slug }: { slug: string }): Promise<IpcResponse<ITaskList>> => {
		try {
			const list = await db.select().from(taskList).where(eq(taskList.slug, slug));

			if (!list) {
				return {
					success: false,
					error: { code: 'NOT_FOUND', message: 'List not found' },
				};
			}

			const listDomain = TaskListMapper.toDomain(list[0]);

			return { success: true, data: listDomain };
		} catch (err) {
			return {
				success: false,
				error: { code: 'INTERNAL_ERROR', message: 'Failed to load list', details: err },
			};
		}
	}
);

ipcMain.handle(IPC.TASK_LIST.CREATE, async (_event, raw: ISaveTaskListRequest): Promise<IpcResponse<ITaskList>> => {
	try {
		const allTaskLists = await db.select().from(taskList).orderBy(desc(taskList.position)).limit(1);

		const lastPosition = allTaskLists[0]?.position ?? 1;

		const position = raw.position ?? lastPosition + 1;
		const title = raw.title === '' || raw.title === undefined ? `New List ${position}` : raw.title;
		const slug = generateSlug(title);
		const listId = randomUUID();

		const [list] = await db
			.insert(taskList)
			.values({
				id: listId,
				title,
				slug,
				position,
			})
			.returning();

		const listDomain = TaskListMapper.toDomain(list);

		return { success: true, data: listDomain };
	} catch (err) {
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while creating the task list',
				details: err,
			},
		};
	}
});
