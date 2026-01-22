import { DrizzleTaskOccurrence } from '../schema';
import { ITaskOccurrence } from '~/src/shared/types/task-occurrence';

export class TaskOccurrenceMapper {
	static toDomain(data: DrizzleTaskOccurrence): ITaskOccurrence {
		return {
			id: data.id,
			taskDefinitionId: data.taskDefinitionId,
			occurrenceDateTime: data.occurrenceDateTime ? new Date(data.occurrenceDateTime) : null,
			status: data.status,
			note: data.note,
			completedAt: data.completedAt ? new Date(data.completedAt) : null,
			createdAt: new Date(data.createdAt),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
		};
	}

	static toDrizzle(data: ITaskOccurrence): DrizzleTaskOccurrence {
		return {
			id: data.id,
			taskDefinitionId: data.taskDefinitionId,
			occurrenceDateTime: data.occurrenceDateTime ? data.occurrenceDateTime.toISOString() : null,
			status: data.status,
			note: data.note ?? null,
			completedAt: data.completedAt ? data.completedAt.toISOString() : null,
			createdAt: data.createdAt.toISOString(),
			updatedAt: data.updatedAt ? data.updatedAt.toISOString() : null,
		};
	}
}
