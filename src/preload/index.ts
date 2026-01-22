import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

import { IUser } from '../shared/types/user';
import { IPC } from '../shared/constants/ipc';
import { ITask, ITaskList } from '../shared/types/task';
import {
	ICreateTaskRequest,
	ICreateUserRequest,
	ICreateUserResponse,
	IGetUserRequest,
	IpcResponse,
	ISaveTaskListRequest,
} from '../shared/types/ipc';

// Custom APIs for renderer
const api = {
	getLastActiveUser(): Promise<IpcResponse<IUser | null>> {
		return ipcRenderer.invoke(IPC.AUTH.GET_LAST_ACTIVE_USER);
	},
	setLastActiveUser(data: { uid: string }): Promise<IpcResponse<null>> {
		return ipcRenderer.invoke(IPC.AUTH.SET_LAST_ACTIVE_USER, data);
	},
	clearLastActiveUser(): Promise<IpcResponse<null>> {
		return ipcRenderer.invoke(IPC.AUTH.CLEAR_LAST_ACTIVE_USER);
	},

	getUser(data: IGetUserRequest): Promise<IpcResponse<IUser>> {
		return ipcRenderer.invoke(IPC.USERS.GET, data);
	},
	createUser(data: ICreateUserRequest): Promise<IpcResponse<ICreateUserResponse>> {
		return ipcRenderer.invoke(IPC.USERS.CREATE, data);
	},

	listingAllTaskLists(): Promise<{ data: ITaskList[] }> {
		return ipcRenderer.invoke(IPC.TASK_LIST.FETCH_ALL);
	},
	getTaskListBySlug(data: { slug: string }): Promise<IpcResponse<ITaskList>> {
		return ipcRenderer.invoke(IPC.TASK_LIST.GET_BY_SLUG, data);
	},
	createTaskList(data: ISaveTaskListRequest): Promise<IpcResponse<ITaskList>> {
		return ipcRenderer.invoke(IPC.TASK_LIST.CREATE, data);
	},

	createTask(data: ICreateTaskRequest): Promise<IpcResponse<ITask>> {
		return ipcRenderer.invoke(IPC.TASKS.CREATE, data);
	},
	listingTasks(): Promise<{ data: ITask[] }> {
		return ipcRenderer.invoke(IPC.TASKS.FETCH_ALL);
	},
};

console.log('preload loaded. contextIsolated:', process.contextIsolated);

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', electronAPI);
		contextBridge.exposeInMainWorld('api', api);
	} catch (error) {
		console.error(error);
	}
} else {
	window.electron = electronAPI;
	window.api = api;
}
