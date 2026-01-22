import { ITask } from '~/src/shared/types/task';
import { SubtaskMapper } from './subtask-mapper';
import { TaskDefinitionMapper } from './task-definition-mapper';
import { RecurrenceRuleMapper } from './recurrence-rule-mapper';
import { TaskOccurrenceMapper } from './task-occurrence-mapper';
import { DrizzleRecurrenceRule, DrizzleSubtask, DrizzleTaskDefinition, DrizzleTaskOccurrence } from '../schema';

interface IRequestToDomain {
	taskDefinition: DrizzleTaskDefinition;
	recurrenceRule: DrizzleRecurrenceRule;
	occurrences?: DrizzleTaskOccurrence[] | null;
	subtasks?: DrizzleSubtask[] | null;
}

export class TaskMapper {
	static toDomain(data: IRequestToDomain): ITask {
		return {
			taskDefinition: TaskDefinitionMapper.toDomain(data.taskDefinition),
			recurrenceRule: RecurrenceRuleMapper.toDomain(data.recurrenceRule),
			occurrences: data.occurrences ? data.occurrences.map(TaskOccurrenceMapper.toDomain) : null,
			subtasks: data.subtasks ? data.subtasks.map(SubtaskMapper.toDomain) : null,
		};
	}
}
