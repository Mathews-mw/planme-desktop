import { getTaskListBySlug } from '../ipc-requests/get-task-list-by-slug';

export function getTaskListBySlugQuery(slug: string) {
	return {
		queryKey: ['task-list', slug],
		queryFn: () => getTaskListBySlug(slug),
	};
}
