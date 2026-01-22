import { ElectronAPI } from '@electron-toolkit/preload';

export {};

declare global {
	interface Window {
		electron: ElectronAPI;
		api: {
			getLastActiveUser(): Promise<
				import('../shared/types/ipc').IpcResponse<import('../shared/types/user').IUser | null>
			>;
			setLastActiveUser(data: { uid: string }): Promise<import('../shared/types/ipc').IpcResponse<null>>;
			clearLastActiveUser(): Promise<import('../shared/types/ipc').IpcResponse<null>>;

			getUser(
				data: import('../shared/types/ipc').IGetUserRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/user').IUser>>;
			createUser(
				data: import('../shared/types/ipc').ICreateUserRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/ipc').ICreateUserResponse>>;

			listingAllTaskLists(): Promise<{ data: import('../shared/types/task').ITaskList[] }>;
			getTaskListBySlug({
				slug,
			}: {
				slug: string;
			}): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/task').ITaskList>>;
			createTaskList(
				data: import('../shared/types/ipc').ISaveTaskListRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/task').ITaskList>>;

			createTask(
				data: import('../shared/types/ipc').ICreateTaskRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/task').ITask>>;
			listingTasks(): Promise<{ data: import('../shared/types/task').ITask[] }>;
		};
	}
}
