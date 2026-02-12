import dayjs from 'dayjs';
import { IRecurrenceEndType, IRecurrenceFrequency } from '~/src/shared/types/recurrence-rule';

export function getRecurrenceLabel({
	frequency,
	interval,
	dayOfMonth,
	endDate,
	maxOccurrences,
	recurrenceEndType,
}: {
	frequency: IRecurrenceFrequency;
	interval?: number | null;
	dayOfMonth?: number | null;
	recurrenceEndType?: IRecurrenceEndType | null;
	endDate?: Date | null;
	maxOccurrences?: number | null;
}) {
	let result: { repetition: string; ends?: string } = {
		repetition: 'No recurrence',
	};

	switch (frequency) {
		case 'DAILY_INTERVAL':
			result = {
				repetition: `Repeats every ${interval ?? 1} day(s)`,
			};
			break;
		case 'MONTHLY_DAY_OF_MONTH':
			result = {
				repetition: `Repeats each month on day ${dayOfMonth}`,
			};
			break;
		case 'WEEKLY_DAYS':
			result = { repetition: `Repeats every week on selected days:` };
			break;
		case 'YEARLY_INTERVAL':
			result = {
				repetition: `Repeats every ${interval ?? 1} year(s)`,
			};
			break;
		case 'NONE':
			result = { repetition: 'No recurrence' };
			break;
		default:
			result = { repetition: 'No recurrence' };
			break;
	}

	switch (recurrenceEndType) {
		case 'NEVER':
			result = { ...result, ends: 'Never ends' };
			break;
		case 'AFTER_OCCURRENCES':
			result = {
				...result,
				ends: `Ends after ${maxOccurrences ?? 1} occurrences`,
			};
			break;
		case 'ON_DATE':
			result = {
				...result,
				ends: `Ends on ${dayjs(endDate!).format('MMMM DD, YYYY')}`,
			};
			break;
	}

	return result;
}
