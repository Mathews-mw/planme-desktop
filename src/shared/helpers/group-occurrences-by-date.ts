import type { ITask } from '../types/task';
import { dayKeyLocal, groupTitle, type GroupTasksKey, type TaskWithNext } from './group-tasks-utilities';

export function groupOccurrencesByDate({ tasks, now = new Date() }: { tasks: ITask[]; now?: Date }) {
	const enriched: TaskWithNext[] = tasks.map((t) => ({
		...t,
		nextOccurrenceAt: t.occurrences[0].occurrenceDateTime,
	}));

	const map = new Map<GroupTasksKey, TaskWithNext[]>();

	for (const t of enriched) {
		const next = t.nextOccurrenceAt;

		let key: GroupTasksKey;

		if (!next) {
			key = 'no-date';
		} else {
			const isOverdue = next.getTime() < now.getTime();

			if (isOverdue) {
				key = 'overdue';
			} else {
				key = dayKeyLocal(next);
			}
		}

		const arr = map.get(key) ?? [];
		arr.push(t);
		map.set(key, arr);
	}

	// Transformar em array
	const groups = Array.from(map.entries()).map(([key, items]) => {
		const date = key === 'overdue' || key === 'no-date' ? null : new Date(`${key}T00:00:00`);

		return {
			key,
			title: groupTitle(key),
			date,
			items,
		};
	});

	// Ordenar grupos: overdue primeiro, depois datas asc, no-date por último
	groups.sort((a, b) => {
		if (a.key === 'overdue') return b.key === 'overdue' ? 0 : -1;
		if (b.key === 'overdue') return 1;

		if (a.key === 'no-date') return b.key === 'no-date' ? 0 : 1;
		if (b.key === 'no-date') return -1;

		return a.date!.getTime() - b.date!.getTime();
	});

	// Ordenar itens dentro do grupo
	for (const g of groups) {
		g.items.sort((a, b) => {
			const ta = a.nextOccurrenceAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
			const tb = b.nextOccurrenceAt?.getTime() ?? Number.MAX_SAFE_INTEGER;

			if (g.key === 'overdue') return ta - tb; // mais antigo primeiro
			return ta - tb; // normal: mais cedo primeiro
		});
	}

	return groups;
}
