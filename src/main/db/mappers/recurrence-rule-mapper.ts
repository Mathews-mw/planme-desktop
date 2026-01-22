import { DrizzleRecurrenceRule } from '../schema';
import { IRecurrenceRule } from '~/src/shared/types/recurrence-rule';
import { decodeWeekdays, encodeWeekdays } from '~/src/shared/recurrence-engine/weekdays-bitmask';

export class RecurrenceRuleMapper {
	static toDomain(data: DrizzleRecurrenceRule): IRecurrenceRule {
		const recurrenceRule: IRecurrenceRule = {
			id: data.id,
			frequency: data.frequency,
			endType: data.endType,
			startDateTime: data.startDateTime ? new Date(data.startDateTime) : null,
			endDate: data.endDate ? new Date(data.endDate) : null,
			interval: data.interval,
			weekdays: data.weekdaysBitmask ? decodeWeekdays(data.weekdaysBitmask) : null,
			dayOfMonth: data.dayOfMonth,
			maxOccurrences: data.maxOccurrences,
			createdAt: new Date(data.createdAt),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
		};

		return recurrenceRule;
	}

	static toDrizzle(data: IRecurrenceRule): DrizzleRecurrenceRule {
		return {
			id: data.id.toString(),
			frequency: data.frequency,
			endType: data.endType,
			startDateTime: data.startDateTime ? data.startDateTime.toISOString() : null,
			endDate: data.endDate ? data.endDate.toISOString() : null,
			interval: data.interval ?? null,
			weekdaysBitmask: data.weekdays ? encodeWeekdays(data.weekdays) : null,
			dayOfMonth: data.dayOfMonth ?? null,
			maxOccurrences: data.maxOccurrences ?? null,
			createdAt: data.createdAt.toISOString(),
			updatedAt: data.updatedAt ? data.updatedAt.toISOString() : null,
		};
	}
}
