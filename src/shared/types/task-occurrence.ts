import z from 'zod';

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
