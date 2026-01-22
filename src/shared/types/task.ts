import { ISubtask } from './subtask';
import { IRecurrenceRule } from './recurrence-rule';
import { ITaskDefinition } from './task-definition';
import { ITaskOccurrence } from './task-occurrence';

export interface ITask {
	taskDefinition: ITaskDefinition;
	recurrenceRule: IRecurrenceRule;
	occurrences?: Array<ITaskOccurrence> | null;
	subtasks?: Array<ISubtask> | null;
}

export interface ITaskList {
	id: string;
	slug: string;
	title: string;
	icon?: string | null;
	position: number;
	createdAt: Date;
	updatedAt?: Date | null;
}
