import { ISubtask } from './subtask';
import { IRecurrenceRule } from './recurrence-rule';
import { ITaskDefinition } from './task-definition';
import { ITaskOccurrence } from './task-occurrence';

export interface ITask {
	id: string;
	taskDefinition: ITaskDefinition;
	recurrenceRule: IRecurrenceRule;
	occurrences?: Array<ITaskOccurrence> | null;
	subtasks?: Array<ISubtask> | null;
}
