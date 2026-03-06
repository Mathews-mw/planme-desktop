import {
	ICreateTaskRequest,
	IDeleteTaskRequest,
	IRecreateTaskRequest,
	ITaskCursorBasedQuery,
	ITaskQuery,
	IToggleTaskComplete,
	IToggleTaskFavorite,
	IUpdateTaskRequest,
} from '~/src/shared/types/ipc';

export const taskRepository = {
	create: (payload: ICreateTaskRequest) => window.api.createTask(payload),
	recreate: (payload: IRecreateTaskRequest) => window.api.recreateTask(payload),
	update: (payload: IUpdateTaskRequest) => window.api.updateTask(payload),
	delete: (payload: IDeleteTaskRequest) => window.api.deleteTask(payload),
	listingTasks: (query: ITaskQuery) => window.api.listingTasks(query),
	listingTasksCursorBased: (query: ITaskCursorBasedQuery) => window.api.listingTasksCursorBased(query),
	toggleComplete: (payload: IToggleTaskComplete) => window.api.toggleCompleteTask(payload),
	toggleFavoriteTask: (payload: IToggleTaskFavorite) => window.api.toggleFavoriteTask(payload),
};
