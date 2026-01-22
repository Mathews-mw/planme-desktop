import dayjs from 'dayjs';

import { IRecurrenceRule } from '../types/recurrence-rule';
import { generateOccurrences } from './recurrence-generator';

interface IGenerateInitialOccurrencesRequest {
	rule: IRecurrenceRule;
	fromDate: Date; // normalmente agora, ou rule.startDateTime
	horizonDays: number; // p.ex. 60 dias pra frente
	limit?: number;
}

export class TaskOccurrencesPlanner {
	static generateInitialOccurrences({
		rule,
		fromDate,
		horizonDays,
		limit,
	}: IGenerateInitialOccurrencesRequest): Date[] {
		const toDate = dayjs(fromDate).add(horizonDays, 'day').toDate();

		const maxToGenerate = limit ?? 1000; // limite de segurança

		const occurrences = generateOccurrences({
			rule,
			fromDate,
			maxToGenerate,
		}).filter((d) => d <= toDate);

		return occurrences;
	}
}
