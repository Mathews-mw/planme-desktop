import type { ITask } from '../types/task';
import { getNextOccurrenceFromRule } from './get-next-occurrence-from-rule';

type TaskGroupKey = string; // "YYYY-MM-DD" | "no-date"

function toLocalDayKey(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

type TaskGroup = {
	key: TaskGroupKey;
	title: string;
	date: Date | null;
	items: ITask[];
};

export function groupTasksByNextOccurrence({ tasks, now = new Date() }: { tasks: ITask[]; now?: Date }): TaskGroup[] {
	const map = new Map<TaskGroupKey, TaskGroup>();

	for (const task of tasks) {
		const next = getNextOccurrenceFromRule({ task, from: now });
		const key: TaskGroupKey = next ? toLocalDayKey(next) : 'no-date';

		const group = map.get(key);
		if (!group) {
			map.set(key, {
				key,
				title: key === 'no-date' ? 'No date' : key.replaceAll('-', '/'),
				date: next ? new Date(next.getFullYear(), next.getMonth(), next.getDate()) : null,
				items: [task],
			});
		} else {
			group.items.push(task);
		}
	}

	const groups = Array.from(map.values()).sort((a, b) => {
		if (a.key === 'no-date') return 1;
		if (b.key === 'no-date') return -1;
		return a.date!.getTime() - b.date!.getTime();
	});

	// ordenar tasks dentro do grupo pela hora da próxima ocorrência
	for (const g of groups) {
		g.items.sort((a, b) => {
			const da = getNextOccurrenceFromRule({ task: a, from: now })?.getTime() ?? Number.MAX_SAFE_INTEGER;
			const db = getNextOccurrenceFromRule({ task: b, from: now })?.getTime() ?? Number.MAX_SAFE_INTEGER;
			return da - db;
		});
	}

	return groups;
}
