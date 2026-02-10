import type { ITask } from '~/src/shared/types/task';
import type { ISubtask } from '~/src/shared/types/subtask';
import type { ITaskDefinition } from '~/src/shared/types/task-definition';
import type { IRecurrenceRule } from '~/src/shared/types/recurrence-rule';
import type { ITaskOccurrence } from '~/src/shared/types/task-occurrence';

interface IRequest {
	taskDefinition: ITaskDefinition;
	recurrenceRule: IRecurrenceRule;
	occurrences: ITaskOccurrence[];
	subtasks?: ISubtask[] | null;
}

export class TaskFactory {
	static create(data: IRequest): ITask {
		return {
			taskDefinition: data.taskDefinition,
			recurrenceRule: data.recurrenceRule,
			occurrences: data.occurrences,
			subtasks: data.subtasks ? data.subtasks : null,
		};
	}
}
