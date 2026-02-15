import {
	ICreateSubtaskRequest,
	IDeleteSubtaskRequest,
	IListingSubtasksQuery,
	IReorderSubtasksRequest,
	IToggleCompleteSubtaskRequest,
	IUpdateSubtaskRequest,
} from '~/src/shared/types/ipc';

export const subtaskRepository = {
	create: (payload: ICreateSubtaskRequest) => window.api.createSubtask(payload),
	update: (payload: IUpdateSubtaskRequest) => window.api.updateSubtask(payload),
	delete: (payload: IDeleteSubtaskRequest) => window.api.deleteSubtask(payload),
	reorder: (payload: IReorderSubtasksRequest) => window.api.reorderSubtask(payload),
	toggleComplete: (payload: IToggleCompleteSubtaskRequest) => window.api.toggleCompleteSubtask(payload),
	listing: (payload: IListingSubtasksQuery) => window.api.listingSubtask(payload),
};
