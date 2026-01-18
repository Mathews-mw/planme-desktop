import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

import { ITask } from '../shared/types/task';
import { IUser } from '../shared/types/user';
import { IPC } from '../shared/constants/ipc';
import {
	ICreateTaskRequest,
	ICreateUserRequest,
	ICreateUserResponse,
	IGetUserRequest,
	IpcResponse,
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
	createTask(data: ICreateTaskRequest): Promise<IpcResponse<ITask>> {
		return ipcRenderer.invoke(IPC.TASKS.CREATE, data);
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
