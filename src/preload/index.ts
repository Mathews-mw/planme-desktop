import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

import { ITask } from "../shared/types/task";
import { IPC } from "../shared/constants/ipc";
import { ICreateTaskRequest, IpcResponse } from "../shared/types/ipc";

// Custom APIs for renderer
const api = {
	createTask(data: ICreateTaskRequest): Promise<IpcResponse<ITask>> {
		return ipcRenderer.invoke(IPC.TASKS.CREATE, data);
	},
};

console.log("preload loaded. contextIsolated:", process.contextIsolated);

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld("electron", electronAPI);
		contextBridge.exposeInMainWorld("api", api);
	} catch (error) {
		console.error(error);
	}
} else {
	window.electron = electronAPI;
	window.api = api;
}
