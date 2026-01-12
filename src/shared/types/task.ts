export type ITaskPriority = "LOW" | "NORMAL" | "HIGH" | "NONE";

export interface ISubtask {
	id: string;
	taskId: string;
	title: string;
	description?: string | null;
	position: number;
	isCompleted: boolean;
	createdAt: string;
	updatedAt?: string | null;
}

export interface ITask {
	id: string;
	title: string;
	description?: string | null;
	priority: ITaskPriority;
	isStarred: boolean;
	dateTime?: string | null;
	isCompleted: boolean;
	createdAt: string;
	updatedAt?: string | null;
	subtasks?: ISubtask[] | null;
}
