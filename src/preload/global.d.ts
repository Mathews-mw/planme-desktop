import { ElectronAPI } from '@electron-toolkit/preload';
import { ISubtask } from '../shared/types/subtask';

export {};

declare global {
	interface Window {
		electron: ElectronAPI;
		api: {
			// === Auth ===
			getLastActiveUser(): Promise<
				import('../shared/types/ipc').IpcResponse<import('../shared/types/user').IUser | null>
			>;
			setLastActiveUser(data: { uid: string }): Promise<import('../shared/types/ipc').IpcResponse<null>>;
			clearLastActiveUser(): Promise<import('../shared/types/ipc').IpcResponse<null>>;

			// === Users ===
			getUser(
				data: import('../shared/types/ipc').IGetUserRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/user').IUser>>;
			createUser(
				data: import('../shared/types/ipc').ICreateUserRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/ipc').ICreateUserResponse>>;

			// === Task Lists ===
			listingAllTaskLists(): Promise<{ data: import('../shared/types/task').ITaskList[] }>;
			getTaskListBySlug({
				slug,
			}: {
				slug: string;
			}): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/task').ITaskList>>;
			createTaskList(
				data: import('../shared/types/ipc').ISaveTaskListRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/task').ITaskList>>;
			editTaskList(
				data: import('../shared/types/ipc').ISaveTaskListRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/task').ITaskList>>;
			deleteTaskList({ id }: { id: string }): Promise<import('../shared/types/ipc').IpcResponse<null>>;
			copyTaskList({
				id,
			}: {
				id: string;
			}): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/task').ITaskList>>;

			// === Tasks ===
			createTask(
				data: import('../shared/types/ipc').ICreateTaskRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/task').ITask>>;
			updateTask(
				data: import('../shared/types/ipc').IUpdateTaskRequest
			): Promise<import('../shared/types/ipc').IpcResponse<null>>;
			listingTasks(
				query: import('../shared/types/ipc').ITaskQuery
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/task').ITask[]>>;
			toggleCompleteTask(
				data: import('../shared/types/ipc').IToggleTaskComplete
			): Promise<import('../shared/types/ipc').IpcResponse<null>>;
			toggleFavoriteTask(
				data: import('../shared/types/ipc').IToggleTaskFavorite
			): Promise<import('../shared/types/ipc').IpcResponse<null>>;

			// === Occurrences ===
			listingOccurrences(
				query: import('../shared/types/ipc').IOccurrencesQuery
			): Promise<
				import('../shared/types/ipc').IpcResponse<import('../shared/types/task-occurrence').ITaskOccurrenceDetails[]>
			>;

			// === Subtasks ===
			createSubtask(
				data: import('../shared/types/ipc').ICreateSubtaskRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/subtask').ISubtask>>;
			updateSubtask(
				data: import('../shared/types/ipc').IUpdateSubtaskRequest
			): Promise<import('../shared/types/ipc').IpcResponse<import('../shared/types/subtask').ISubtask>>;
			deleteSubtask(
				data: import('../shared/types/ipc').IDeleteSubtaskRequest
			): Promise<import('../shared/types/ipc').IpcResponse<null>>;
			toggleCompleteSubtask(
				data: import('../shared/types/ipc').IToggleCompleteSubtaskRequest
			): Promise<import('../shared/types/ipc').IpcResponse<null>>;
			reorderSubtask(
				data: import('../shared/types/ipc').IReorderSubtasksRequest
			): Promise<import('../shared/types/ipc').IpcResponse<null>>;
			listingSubtask(
				data: import('../shared/types/ipc').IListingSubtasksQuery
			): Promise<import('../shared/types/ipc').IpcResponse<ISubtask[]>>;
		};
	}
}
