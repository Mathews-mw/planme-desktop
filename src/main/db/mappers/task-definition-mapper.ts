import { DrizzleTaskDefinition } from '../schema';
import { ITaskDefinition } from '~/src/shared/types/task-definition';

export class TaskDefinitionMapper {
	static toDomain(data: DrizzleTaskDefinition): ITaskDefinition {
		return {
			id: data.id,
			userId: data.userId,
			listSlug: data.listSlug,
			title: data.title,
			description: data.description,
			deadline: data.deadline ? new Date(data.deadline) : null,
			priority: data.priority,
			isAllDay: data.isAllDay,
			isStarred: data.isStarred,
			recurrenceRuleId: data.recurrenceRuleId,
			createdAt: new Date(data.createdAt),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
		};
	}

	static toDrizzle(data: ITaskDefinition): DrizzleTaskDefinition {
		return {
			id: data.id,
			userId: data.userId,
			listSlug: data.listSlug,
			title: data.title,
			description: data.description ?? null,
			deadline: data.deadline ? data.deadline.toISOString() : null,
			priority: data.priority,
			isAllDay: data.isAllDay,
			isStarred: data.isStarred,
			recurrenceRuleId: data.recurrenceRuleId,
			createdAt: data.createdAt.toISOString(),
			updatedAt: data.updatedAt ? data.updatedAt.toISOString() : null,
		};
	}
}
