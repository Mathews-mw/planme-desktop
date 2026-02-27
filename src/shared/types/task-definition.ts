import z from 'zod';

export const taskPrioritySchema = z.union([
	z.literal('LOW'),
	z.literal('NORMAL'),
	z.literal('HIGH'),
	z.literal('NONE'),
]);

export const taskPrioritiesOptions = taskPrioritySchema.options.map((opt) => ({
	value: opt.value,
	label: `${opt.value[0] + opt.value.slice(1).toLowerCase()}`,
}));

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
