import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

import { IUser } from '../shared/types/user';
import { IPC } from '../shared/constants/ipc';
import { ISubtask } from '../shared/types/subtask';
import { ITask, ITaskList } from '../shared/types/task';
import { ITaskOccurrenceDetails } from '../shared/types/task-occurrence';
import {
	ICreateSubtaskRequest,
	ICreateTaskRequest,
	ICreateUserRequest,
	ICreateUserResponse,
	IDeleteSubtaskRequest,
	IGetUserRequest,
	IListingSubtasksQuery,
	IOccurrencesQuery,
	IpcResponse,
	IReorderSubtasksRequest,
	ISaveTaskListRequest,
	ITaskQuery,
	IToggleCompleteSubtaskRequest,
	IToggleTaskComplete,
	IToggleTaskFavorite,
	IUpdateSubtaskRequest,
} from '../shared/types/ipc';

// Custom APIs for renderer
const api = {
	// === Auth ===
	getLastActiveUser(): Promise<IpcResponse<IUser | null>> {
		return ipcRenderer.invoke(IPC.AUTH.GET_LAST_ACTIVE_USER);
	},
	setLastActiveUser(data: { uid: string }): Promise<IpcResponse<null>> {
		return ipcRenderer.invoke(IPC.AUTH.SET_LAST_ACTIVE_USER, data);
	},
	clearLastActiveUser(): Promise<IpcResponse<null>> {
		return ipcRenderer.invoke(IPC.AUTH.CLEAR_LAST_ACTIVE_USER);
	},

	// === Users ===
	getUser(data: IGetUserRequest): Promise<IpcResponse<IUser>> {
		return ipcRenderer.invoke(IPC.USERS.GET, data);
	},
	createUser(data: ICreateUserRequest): Promise<IpcResponse<ICreateUserResponse>> {
		return ipcRenderer.invoke(IPC.USERS.CREATE, data);
	},

	// === Task Lists ===
	listingAllTaskLists(): Promise<{ data: ITaskList[] }> {
		return ipcRenderer.invoke(IPC.TASK_LIST.FETCH_ALL);
	},
	getTaskListBySlug(data: { slug: string }): Promise<IpcResponse<ITaskList>> {
		return ipcRenderer.invoke(IPC.TASK_LIST.GET_BY_SLUG, data);
	},
	createTaskList(data: ISaveTaskListRequest): Promise<IpcResponse<ITaskList>> {
		return ipcRenderer.invoke(IPC.TASK_LIST.CREATE, data);
	},
	editTaskList(data: ISaveTaskListRequest): Promise<IpcResponse<ITaskList>> {
		return ipcRenderer.invoke(IPC.TASK_LIST.EDIT, data);
	},
	deleteTaskList(data: { id: string }): Promise<IpcResponse<null>> {
		return ipcRenderer.invoke(IPC.TASK_LIST.DELETE, data);
	},
	copyTaskList(data: { id: string }): Promise<IpcResponse<ITaskList>> {
		return ipcRenderer.invoke(IPC.TASK_LIST.COPY, data);
	},

	// === Tasks ===
	createTask(data: ICreateTaskRequest): Promise<IpcResponse<ITask>> {
		return ipcRenderer.invoke(IPC.TASKS.CREATE, data);
	},
	listingTasks(query: ITaskQuery): Promise<IpcResponse<ITask[]>> {
		return ipcRenderer.invoke(IPC.TASKS.FETCH_ALL, query);
	},
	toggleCompleteTask(data: IToggleTaskComplete): Promise<IpcResponse<null>> {
		return ipcRenderer.invoke(IPC.TASKS.TOGGLE_COMPLETE, data);
	},
	toggleFavoriteTask(data: IToggleTaskFavorite): Promise<IpcResponse<null>> {
		return ipcRenderer.invoke(IPC.TASKS.TOGGLE_FAVORITE, data);
	},

	// === Occurrences ===
	listingOccurrences(query: IOccurrencesQuery): Promise<IpcResponse<ITaskOccurrenceDetails[]>> {
		return ipcRenderer.invoke(IPC.OCCURRENCES.FETCH_ALL, query);
	},

	// === Subtasks ===
	createSubtask(data: ICreateSubtaskRequest): Promise<IpcResponse<ISubtask>> {
		return ipcRenderer.invoke(IPC.SUBTASKS.CREATE, data);
	},
	updateSubtask(data: IUpdateSubtaskRequest): Promise<IpcResponse<ISubtask>> {
		return ipcRenderer.invoke(IPC.SUBTASKS.UPDATE, data);
	},
	deleteSubtask(data: IDeleteSubtaskRequest): Promise<IpcResponse<null>> {
		return ipcRenderer.invoke(IPC.SUBTASKS.DELETE, data);
	},
	toggleCompleteSubtask(data: IToggleCompleteSubtaskRequest): Promise<IpcResponse<null>> {
		return ipcRenderer.invoke(IPC.SUBTASKS.TOGGLE_COMPLETE, data);
	},
	reorderSubtask(data: IReorderSubtasksRequest): Promise<IpcResponse<null>> {
		return ipcRenderer.invoke(IPC.SUBTASKS.REORDER, data);
	},
	listingSubtask(query: IListingSubtasksQuery): Promise<IpcResponse<ISubtask[]>> {
		return ipcRenderer.invoke(IPC.SUBTASKS.FETCH_ALL, query);
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
