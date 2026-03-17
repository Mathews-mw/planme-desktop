export type TTaskStatus = 'PENDING' | 'COMPLETED' | 'CANCELED' | 'SKIPPED';

export interface TScheduledTaskOccurrence {
	taskDefinitionId: string;
	occurrenceId: string;
	title: string;
	description: string | null;
	isAllDay: boolean;
	occurrenceDateTime: string; // ISO
	status: TTaskStatus;
	notifiedAt: string | null;
}
