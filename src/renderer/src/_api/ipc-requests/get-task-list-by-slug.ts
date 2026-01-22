import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';

export async function getTaskListBySlug(slug: string) {
	const res = await taskListRepository.getBySlug({ slug });

	if (!res.success) {
		throw res.error;
	}

	return res.data;
}
