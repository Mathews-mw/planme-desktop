import { ISaveTaskListRequest } from '~/src/shared/types/ipc';

export const taskListRepository = {
	listingAll: () => window.api.listingAllTaskLists(),
	getBySlug: (payload: { slug: string }) => window.api.getTaskListBySlug(payload),
	create: (payload: ISaveTaskListRequest) => window.api.createTaskList(payload),
};
