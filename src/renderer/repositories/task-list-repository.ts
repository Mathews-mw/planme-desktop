import { ISaveTaskListRequest } from '~/src/shared/types/ipc';

export const taskListRepository = {
	listingAll: () => window.api.listingAllTaskLists(),
	create: (payload: ISaveTaskListRequest) => window.api.createTaskList(payload),
};
