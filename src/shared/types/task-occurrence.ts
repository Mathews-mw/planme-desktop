export type ITaskStatus = 'PENDING' | 'COMPLETED' | 'CANCELED' | 'SKIPPED';

export interface ITaskOccurrence {
	id: string;
	taskDefinitionId: string;
	occurrenceDateTime?: Date | null;
	status: ITaskStatus;
	note?: string | null;
	completedAt?: Date | null;
	createdAt: Date;
	updatedAt?: Date | null;
}
