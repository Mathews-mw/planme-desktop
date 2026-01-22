import { DrizzleTaskList } from '../schema';
import { ITaskList } from '~/src/shared/types/task';

export class TaskListMapper {
	static toDomain(data: DrizzleTaskList): ITaskList {
		return {
			id: data.id,
			slug: data.slug,
			title: data.title,
			position: data.position,
			icon: data.icon,
			createdAt: new Date(data.createdAt),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
		};
	}

	static toDrizzle(data: ITaskList): DrizzleTaskList {
		return {
			id: data.id,
			slug: data.slug,
			title: data.title,
			icon: data.icon ?? null,
			position: data.position,
			createdAt: data.createdAt.toISOString(),
			updatedAt: data.updatedAt ? data.updatedAt.toISOString() : null,
		};
	}
}
