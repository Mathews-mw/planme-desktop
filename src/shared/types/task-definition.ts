import z from 'zod';

export const taskPrioritySchema = z.union([
	z.literal('LOW'),
	z.literal('NORMAL'),
	z.literal('HIGH'),
	z.literal('NONE'),
]);

export type ITaskPriority = z.infer<typeof taskPrioritySchema>;

export interface ITaskDefinition {
	id: string;
	userId: string;
	listSlug: string;
	title: string;
	description?: string | null;
	deadline?: Date | null;
	priority: ITaskPriority;
	isAllDay: boolean;
	isStarred: boolean;
	recurrenceRuleId: string;
	createdAt: Date;
	updatedAt?: Date | null;
}
