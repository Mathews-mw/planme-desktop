import { ipcMain } from 'electron';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { ITaskList } from '~/src/shared/types/task';
import { generateSlug } from '~/src/utils/generate-slug';
import { taskDefinitions, taskList } from '~/src/main/db/schema';
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
			const list = await db.query.taskList.findFirst({ where: (fields, operators) => operators.eq(fields.slug, slug) });

			if (!list) {
				return {
					success: false,
					error: { code: 'NOT_FOUND', message: 'List not found' },
				};
			}

			const listDomain = TaskListMapper.toDomain(list);

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

ipcMain.handle(IPC.TASK_LIST.EDIT, async (_event, raw: ISaveTaskListRequest): Promise<IpcResponse<ITaskList>> => {
	try {
		const { id, title, icon, position } = raw;

		const list = await db.query.taskList.findFirst({ where: (fields, operators) => operators.eq(fields.id, id!) });

		if (!list) {
			return {
				success: false,
				error: { code: 'NOT_FOUND', message: 'List not found' },
			};
		}

		if (title && title !== list.title) {
			const newSlug = generateSlug(title);

			const listByNewSlug = await db.query.taskList.findFirst({
				where: (fields, operators) => operators.eq(fields.slug, newSlug),
			});

			if (listByNewSlug) {
				return {
					success: false,
					error: {
						code: 'CONFLICT',
						message: 'The title is already being used by another task. Please provide another one.',
					},
				};
			}

			list.title = title;
			list.slug = newSlug;
		}

		list.icon = icon ?? list.icon;
		list.position = position ?? list.position;
		list.updatedAt = new Date().toISOString();

		await db.update(taskList).set(list).where(eq(taskList.id, list.id));

		const listDomain = TaskListMapper.toDomain(list);

		return { success: true, data: listDomain };
	} catch (err) {
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while updating the task list',
				details: err,
			},
		};
	}
});

ipcMain.handle(IPC.TASK_LIST.DELETE, async (_event, { id }: { id: string }): Promise<IpcResponse<null>> => {
	try {
		const list = await db.query.taskList.findFirst({ where: (fields, operators) => operators.eq(fields.id, id) });
		const mainList = await db.query.taskList.findFirst({
			where: (fields, operators) => operators.eq(fields.slug, 'tasks'),
		});

		if (!list || !mainList) {
			return {
				success: false,
				error: { code: 'NOT_FOUND', message: 'List not found' },
			};
		}

		// Move all task to main list
		await db.update(taskDefinitions).set({ listSlug: mainList.slug }).where(eq(taskDefinitions.listSlug, list.slug));

		await db.delete(taskList).where(eq(taskList.id, list.id));

		return { success: true, data: null };
	} catch (err) {
		return {
			success: false,
			error: { code: 'INTERNAL_ERROR', message: 'Failed to load list', details: err },
		};
	}
});

ipcMain.handle(IPC.TASK_LIST.COPY, async (_event, { id }: { id: string }): Promise<IpcResponse<ITaskList>> => {
	try {
		const list = await db.query.taskList.findFirst({ where: (fields, operators) => operators.eq(fields.id, id) });

		if (!list) {
			return {
				success: false,
				error: { code: 'NOT_FOUND', message: 'List not found' },
			};
		}

		const allTaskLists = await db.select().from(taskList).orderBy(desc(taskList.position)).limit(1);

		const lastPosition = allTaskLists[0]?.position ?? 1;

		const position = lastPosition + 1;
		const title = `${list.title} COPY-${position}`;
		const slug = generateSlug(title);
		const copyListId = randomUUID();

		const [copyList] = await db
			.insert(taskList)
			.values({
				id: copyListId,
				title,
				slug,
				position,
			})
			.returning();

		const copyListDomain = TaskListMapper.toDomain(copyList);

		return { success: true, data: copyListDomain };
	} catch (err) {
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while copy the task list',
				details: err,
			},
		};
	}
});
