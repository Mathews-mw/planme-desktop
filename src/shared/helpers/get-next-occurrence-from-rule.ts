import dayjs from 'dayjs';
import { IRecurrenceFrequency, IRecurrenceRule } from '../types/recurrence-rule';
import { ITask } from '../types/task';
import { generateOccurrences } from '../recurrence-engine/recurrence-generator';

type RecRule = IRecurrenceFrequency;

function parseDate(v?: string | null) {
	if (!v) return null;
	const d = new Date(v);
	return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Converte IRecurrenceRule (renderer) -> RecurrenceRule (domain)
 */
// function toDomainRecurrenceRule(task: ITask) {
// 	const r = task.recurrenceRule;

// 	const weekdaysBitmask = r.weekdays?.length
// 		? weekdaysToBitmask(r.weekdays) // vou deixar abaixo
// 		: null;

// 	return RecurrenceRule.create({
// 		frequency: r.frequency,
// 		endType: r.endType,
// 		startDateTime: parseDate(r.startDateTime) ?? new Date(0), // exige start
// 		endDate: parseDate(r.endDate),
// 		interval: r.interval ?? null,
// 		weekdaysBitmask,
// 		dayOfMonth: r.dayOfMonth ?? null,
// 		maxOccurrences: r.maxOccurrences ?? null,
// 	});
// }

function getBaseStart(task: ITask): Date | null {
	// escolha sua “âncora” para ONE-OFF
	// eu recomendo startDateTime primeiro, depois deadline
	return parseDate(task.recurrenceRule.startDateTime) ?? parseDate(task.taskDefinition.deadline) ?? null;
}

/**
 * Retorna a próxima ocorrência baseada na RecurrenceRule.
 * from: normalmente "agora" (new Date()).
 */
export function getNextOccurrenceFromRule({ task, from }: { task: ITask; from: Date }): Date | null {
	const freq = task.recurrenceRule.frequency;

	// ONE-OFF (NONE): a ocorrência é o start/deadline se ainda estiver no futuro,
	// ou null se já passou (depende da regra de negócio; aqui vou considerar "não tem próxima")
	if (freq === 'NONE') {
		const base = getBaseStart(task);
		if (!base) return null;
		return base.getTime() >= from.getTime() ? base : null;
	}

	const rule = task.recurrenceRule;

	const [next] = generateOccurrences({
		rule,
		fromDate: from,
		maxToGenerate: 1,
	});

	return next ?? null;
}
