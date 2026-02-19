import {
	ICreateTaskRequest,
	ITaskQuery,
	IToggleTaskComplete,
	IToggleTaskFavorite,
	IUpdateTaskRequest,
} from '~/src/shared/types/ipc';

export const taskRepository = {
	create: (payload: ICreateTaskRequest) => window.api.createTask(payload),
	update: (payload: IUpdateTaskRequest) => window.api.updateTask(payload),
	listingTasks: (query: ITaskQuery) => window.api.listingTasks(query),
	toggleComplete: (payload: IToggleTaskComplete) => window.api.toggleCompleteTask(payload),
	toggleFavoriteTask: (payload: IToggleTaskFavorite) => window.api.toggleFavoriteTask(payload),
};
