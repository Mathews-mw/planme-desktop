export interface ISubtask {
	id: string;
	taskDefinitionId: string;
	title: string;
	description?: string | null;
	position: number;
	isCompleted: boolean;
	completedAt?: Date | null;
	createdAt: Date;
	updatedAt?: Date | null;
}
