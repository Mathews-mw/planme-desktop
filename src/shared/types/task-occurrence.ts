import z from 'zod';
import { ITaskDefinition } from './task-definition';
import { IRecurrenceRule } from './recurrence-rule';
import { ISubtask } from './subtask';

export const taskStatusSchema = z.union([
	z.literal('PENDING'),
	z.literal('COMPLETED'),
	z.literal('CANCELED'),
	z.literal('SKIPPED'),
]);

export type ITaskStatus = z.infer<typeof taskStatusSchema>;

export interface ITaskOccurrence {
	id: string;
	taskDefinitionId: string;
	occurrenceDateTime: Date;
	status: ITaskStatus;
	note?: string | null;
	completedAt?: Date | null;
	createdAt: Date;
	updatedAt?: Date | null;
}

interface TaskDefinitionWithProps extends ITaskDefinition {
	recurrenceRule: IRecurrenceRule;
	subtasks: Array<ISubtask>;
}

export interface ITaskOccurrenceDetails extends ITaskOccurrence {
	taskDefinition: TaskDefinitionWithProps;
}
