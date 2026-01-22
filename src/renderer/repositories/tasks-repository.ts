import { ICreateTaskRequest } from '~/src/shared/types/ipc';

export const taskRepository = {
	create: (payload: ICreateTaskRequest) => window.api.createTask(payload),
	listingTasks: () => window.api.listingTasks(),
};
