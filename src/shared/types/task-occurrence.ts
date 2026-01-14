export type ITaskStatus = "PENDING" | "COMPLETED" | "CANCELED" | "SKIPPED";

export interface ITaskOccurrence {
	id: string;
	taskDefinitionId: string;
	occurrenceDateTime?: string | null;
	status: ITaskStatus;
	note?: string | null;
	completedAt?: string | null;
	createdAt: string;
	updatedAt?: string | null;
}
