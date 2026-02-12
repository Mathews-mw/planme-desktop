import { ICreateTaskRequest, ITaskQuery, IToggleTaskComplete, IToggleTaskFavorite } from '~/src/shared/types/ipc';

export const taskRepository = {
	create: (payload: ICreateTaskRequest) => window.api.createTask(payload),
	listingTasks: (query: ITaskQuery) => window.api.listingTasks(query),
	toggleComplete: (payload: IToggleTaskComplete) => window.api.toggleCompleteTask(payload),
	toggleFavoriteTask: (payload: IToggleTaskFavorite) => window.api.toggleFavoriteTask(payload),
};
