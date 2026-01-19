import { ipcMain } from 'electron';
import { randomUUID } from 'node:crypto';

import { store } from '~/src/main/store';
import { IPC } from '~/src/shared/constants/ipc';
import { ITaskList } from '~/src/shared/types/task';
import { IpcResponse, ISaveTaskListRequest } from '~/src/shared/types/ipc';

ipcMain.handle(IPC.TASK_LIST.FETCH_ALL, async (): Promise<{ data: ITaskList[] }> => {
	const allTaskLists = Object.values(store.get('taskList'));

	return {
		data: allTaskLists,
	};
});

ipcMain.handle(IPC.TASK_LIST.CREATE, async (_event, raw: ISaveTaskListRequest): Promise<IpcResponse<ITaskList>> => {
	const allTaskLists = Object.values(store.get('taskList'));

	console.log('raw: ', raw);

	const lastPosition = allTaskLists[allTaskLists.length - 1].position;

	const position = raw.position ?? lastPosition + 1;
	const title = raw.title === '' || raw.title === undefined ? `New List ${position}` : raw.title;

	try {
		const taskList: ITaskList = {
			id: randomUUID(),
			title,
			position,
		};

		store.set(`taskList.${taskList.id}`, taskList);

		return { success: true, data: taskList };
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
