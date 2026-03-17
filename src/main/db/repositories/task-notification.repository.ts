import { TScheduledTaskOccurrence } from '~/src/shared/types/notification';
import { getDb } from '..';
import { taskDefinitions, taskOccurrences } from '../schema';
import { and, asc, eq, gte, isNotNull, isNull, lte } from 'drizzle-orm';

export class TaskNotificationRepository {
	async findPendingBetween(fromIso: string, toIso: string): Promise<TScheduledTaskOccurrence[]> {
		const db = getDb();

		const rows = await db
			.select({
				taskDefinitionId: taskDefinitions.id,
				occurrenceId: taskOccurrences.id,
				title: taskDefinitions.title,
				description: taskDefinitions.description,
				isAllDay: taskDefinitions.isAllDay,
				occurrenceDateTime: taskOccurrences.occurrenceDateTime,
				status: taskOccurrences.status,
				notifiedAt: taskOccurrences.notifiedAt,
			})
			.from(taskOccurrences)
			.innerJoin(taskDefinitions, eq(taskDefinitions.id, taskOccurrences.taskDefinitionId))
			.where(
				and(
					eq(taskOccurrences.status, 'PENDING'),
					isNull(taskOccurrences.notifiedAt),
					isNotNull(taskOccurrences.occurrenceDateTime),
					gte(taskOccurrences.occurrenceDateTime, fromIso),
					lte(taskOccurrences.occurrenceDateTime, toIso)
				)
			)
			.orderBy(asc(taskOccurrences.occurrenceDateTime));

		return rows as TScheduledTaskOccurrence[];
	}

	async findDueUnnotified(nowIso: string): Promise<TScheduledTaskOccurrence[]> {
		const db = getDb();

		const rows = await db
			.select({
				taskDefinitionId: taskDefinitions.id,
				occurrenceId: taskOccurrences.id,
				title: taskDefinitions.title,
				description: taskDefinitions.description,
				isAllDay: taskDefinitions.isAllDay,
				occurrenceDateTime: taskOccurrences.occurrenceDateTime,
				status: taskOccurrences.status,
				notifiedAt: taskOccurrences.notifiedAt,
			})
			.from(taskOccurrences)
			.innerJoin(taskDefinitions, eq(taskDefinitions.id, taskOccurrences.taskDefinitionId))
			.where(
				and(
					eq(taskOccurrences.status, 'PENDING'),
					isNull(taskOccurrences.notifiedAt),
					isNotNull(taskOccurrences.occurrenceDateTime),
					lte(taskOccurrences.occurrenceDateTime, nowIso)
				)
			)
			.orderBy(asc(taskOccurrences.occurrenceDateTime));

		return rows as TScheduledTaskOccurrence[];
	}

	async findCurrentPendingByTaskDefinitionId(taskDefinitionId: string): Promise<TScheduledTaskOccurrence | null> {
		const db = getDb();

		const rows = await db
			.select({
				taskDefinitionId: taskDefinitions.id,
				occurrenceId: taskOccurrences.id,
				title: taskDefinitions.title,
				description: taskDefinitions.description,
				isAllDay: taskDefinitions.isAllDay,
				occurrenceDateTime: taskOccurrences.occurrenceDateTime,
				status: taskOccurrences.status,
				notifiedAt: taskOccurrences.notifiedAt,
			})
			.from(taskOccurrences)
			.innerJoin(taskDefinitions, eq(taskDefinitions.id, taskOccurrences.taskDefinitionId))
			.where(
				and(
					eq(taskDefinitions.id, taskDefinitionId),
					eq(taskOccurrences.status, 'PENDING'),
					isNull(taskOccurrences.notifiedAt),
					isNotNull(taskOccurrences.occurrenceDateTime)
				)
			)
			.orderBy(asc(taskOccurrences.occurrenceDateTime))
			.limit(1);

		return (rows[0] as TScheduledTaskOccurrence | undefined) ?? null;
	}

	async markOccurrenceAsNotified(occurrenceId: string, notifiedAtIso: string): Promise<void> {
		const db = getDb();

		await db
			.update(taskOccurrences)
			.set({
				notifiedAt: notifiedAtIso,
				updatedAt: notifiedAtIso,
			})
			.where(eq(taskOccurrences.id, occurrenceId));
	}
}
