export interface ISubtask {
	id: string;
	taskDefinitionId: string;
	title: string;
	description?: string | null;
	position: number;
	isCompleted: boolean;
	completedAt?: string | null;
	createdAt: string;
	updatedAt?: string | null;
}
