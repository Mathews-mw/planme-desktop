import { InferInsertModel, InferSelectModel, relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex, index, unique } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
	'users',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull(),
		password: text('password'),
		avatarUrl: text('avatar_url'),
		timezone: text('timezone').notNull(),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
		createdAt: text('created_at')
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text('updated_at'),
	},
	(table) => [uniqueIndex('email_index').on(table.email)]
);

export type DrizzleUser = InferSelectModel<typeof users>;
export type DrizzleUserInsert = InferInsertModel<typeof users>;

export const accounts = sqliteTable(
	'accounts',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		provider: text('provider').notNull().$type<'CREDENTIALS' | 'GOOGLE' | 'GITHUB'>(),
		providerAccountId: text('provider_account_id').notNull().unique(),
		createdAt: text('created_at')
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text('updated_at'),
	},
	(table) => [unique().on(table.userId, table.provider), unique().on(table.provider, table.providerAccountId)]
);

export type DrizzleAccount = InferSelectModel<typeof accounts>;
export type DrizzleAccountInsert = InferInsertModel<typeof accounts>;

export const recurrenceRules = sqliteTable(
	'recurrence_rules',
	{
		id: text('id').primaryKey(),
		frequency: text('frequency')
			.notNull()
			.$type<'NONE' | 'DAILY_INTERVAL' | 'WEEKLY_DAYS' | 'MONTHLY_DAY_OF_MONTH' | 'YEARLY_INTERVAL'>(),
		endType: text('end_type').notNull().$type<'ONCE' | 'NEVER' | 'ON_DATE' | 'AFTER_OCCURRENCES'>(),
		startDateTime: text('start_datetime'), // ISO string ou null
		endDate: text('end_date'),
		interval: integer('interval'),
		weekdaysBitmask: integer('weekdays_bitmask'),
		dayOfMonth: integer('day_of_month'),
		maxOccurrences: integer('max_occurrences'),
		createdAt: text('created_at')
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text('updated_at'),
	},
	(table) => [index('frequency_index').on(table.frequency)]
);

export type DrizzleRecurrenceRule = InferSelectModel<typeof recurrenceRules>;
export type DrizzleRecurrenceRuleInsert = InferInsertModel<typeof recurrenceRules>;
export type DrizzleRecurrenceRuleUpdate = Partial<DrizzleRecurrenceRuleInsert>;

export const taskDefinitions = sqliteTable(
	'task_definitions',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		listSlug: text('list_slug')
			.notNull()
			.references(() => taskList.slug, { onDelete: 'no action' }),
		title: text('title').notNull(),
		description: text('description'),
		deadline: text('deadline'), // ISO string | null
		priority: text('priority').notNull().$type<'LOW' | 'NORMAL' | 'HIGH' | 'NONE'>().default('NONE'),
		isAllDay: integer('is_all_day', { mode: 'boolean' }).notNull().default(false),
		isStarred: integer('is_starred', { mode: 'boolean' }).notNull().default(false),
		recurrenceRuleId: text('recurrence_rule_id')
			.notNull()
			.unique()
			.references(() => recurrenceRules.id, { onDelete: 'restrict' }),
		createdAt: text('created_at')
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text('updated_at'),
	},
	(table) => [
		index('user_id_index').on(table.userId),
		index('is_starred_index').on(table.isStarred),
		index('deadline_index').on(table.deadline),
		index('list_slug_index').on(table.listSlug),
	]
);

export type DrizzleTaskDefinition = InferSelectModel<typeof taskDefinitions>;
export type DrizzleTaskDefinitionInsert = InferInsertModel<typeof taskDefinitions>;

export const taskOccurrences = sqliteTable(
	'task_occurrences',
	{
		id: text('id').primaryKey(),
		taskDefinitionId: text('task_definition_id')
			.notNull()
			.references(() => taskDefinitions.id, { onDelete: 'cascade' }),
		occurrenceDateTime: text('occurrence_date_time'), // ISO string
		status: text('status').notNull().$type<'PENDING' | 'COMPLETED' | 'CANCELED' | 'SKIPPED'>().default('PENDING'),
		note: text('note'),
		notifiedAt: text('notified_at'),
		completedAt: text('completed_at'), // ISO string
		createdAt: text('created_at')
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text('updated_at'),
	},
	(table) => [
		index('occ_datetime_index').on(table.taskDefinitionId, table.occurrenceDateTime),
		index('occ_status_index').on(table.status),
	]
);

export type DrizzleTaskOccurrence = InferSelectModel<typeof taskOccurrences>;
export type DrizzleTaskOccurrenceInsert = InferInsertModel<typeof taskOccurrences>;

export const subtasks = sqliteTable(
	'subtasks',
	{
		id: text('id').primaryKey(),
		taskDefinitionId: text('task_definition_id')
			.notNull()
			.references(() => taskDefinitions.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		description: text('description'),
		position: integer('position').notNull(),
		isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
		completedAt: text('completed_at'), // ISO string
		createdAt: text('created_at')
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text('updated_at'),
	},
	(table) => [index('subtask_position_definition').on(table.taskDefinitionId, table.position)]
);

export type DrizzleSubtask = InferSelectModel<typeof subtasks>;
export type DrizzleSubtaskInsert = InferInsertModel<typeof subtasks>;

export const taskList = sqliteTable('task_lists', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	position: integer('position').notNull(),
	icon: text('icon'),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(datetime('now'))`),
	updatedAt: text('updated_at'),
});

export type DrizzleTaskList = InferSelectModel<typeof taskList>;
export type DrizzleTaskListInsert = InferInsertModel<typeof taskList>;

// === Relations ===

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
}));

export const taskDefinitionsRelations = relations(taskDefinitions, ({ one, many }) => ({
	recurrenceRule: one(recurrenceRules, {
		fields: [taskDefinitions.recurrenceRuleId],
		references: [recurrenceRules.id],
	}),
	list: one(taskList, {
		fields: [taskDefinitions.listSlug],
		references: [taskList.slug],
	}),
	occurrences: many(taskOccurrences),
	subtasks: many(subtasks),
}));

export const taskOccurrencesRelations = relations(taskOccurrences, ({ one }) => ({
	taskDefinition: one(taskDefinitions, {
		fields: [taskOccurrences.taskDefinitionId],
		references: [taskDefinitions.id],
	}),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
	taskDefinition: one(taskDefinitions, {
		fields: [subtasks.taskDefinitionId],
		references: [taskDefinitions.id],
	}),
}));

export const taskListsRelations = relations(taskList, ({ many }) => ({
	taskDefinitions: many(taskDefinitions),
}));
