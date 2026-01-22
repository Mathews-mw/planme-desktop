import { ISubtask } from '~/src/shared/types/subtask';
import { DrizzleSubtask } from '../schema';

export class SubtaskMapper {
	static toDomain(data: DrizzleSubtask): ISubtask {
		return {
			id: data.id,
			taskDefinitionId: data.taskDefinitionId,
			title: data.title,
			description: data.description,
			position: data.position,
			isCompleted: data.isCompleted,
			completedAt: data.completedAt ? new Date(data.completedAt) : null,
			createdAt: new Date(data.createdAt),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
		};
	}

	static toDrizzle(data: ISubtask): DrizzleSubtask {
		return {
			id: data.id,
			taskDefinitionId: data.taskDefinitionId,
			title: data.title,
			description: data.description ?? null,
			position: data.position,
			isCompleted: data.isCompleted,
			completedAt: data.completedAt ? data.completedAt.toISOString() : null,
			createdAt: data.createdAt.toISOString(),
			updatedAt: data.updatedAt ? data.updatedAt.toISOString() : null,
		};
	}
}
