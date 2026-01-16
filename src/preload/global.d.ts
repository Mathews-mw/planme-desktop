import { ElectronAPI } from '@electron-toolkit/preload';

export {};

declare global {
	interface Window {
		electron: ElectronAPI;
		api: {
			createUser(
				data: import('../shared/types/ipc').ICreateUserRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/ipc').ICreateUserResponse>>;
			createTask(
				data: import('../shared/types/ipc').ICreateTaskRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/task').ITask>>;
		};
	}
}
