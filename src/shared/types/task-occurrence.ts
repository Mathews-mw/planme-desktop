import z from 'zod';

import { ISubtask } from './subtask';
import { ITaskDefinition } from './task-definition';
import { IRecurrenceRule } from './recurrence-rule';

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
	occurrenceDateTime?: Date | null;
	status: ITaskStatus;
	note?: string | null;
	notifiedAt?: Date | null;
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
