import type { ITask } from '../types/task';
import { getNextOccurrenceAt } from './get-next-occurrence-at';

type GroupKey = string; // "YYYY-MM-DD" | "no-date"

function dayKeyLocal(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

export type TaskWithNext = ITask & { nextOccurrenceAt: Date | null };

export function groupAllTasksByNextOccurrence({ tasks, now = new Date() }: { tasks: ITask[]; now?: Date }) {
	// 1) enriquece tasks com nextOccurrenceAt (1 por task)
	const enriched: TaskWithNext[] = tasks.map((t) => ({
		...t,
		nextOccurrenceAt: getNextOccurrenceAt({ task: t, now }),
	}));

	// 2) agrupa
	const map = new Map<GroupKey, TaskWithNext[]>();

	for (const t of enriched) {
		const key: GroupKey = t.nextOccurrenceAt ? dayKeyLocal(t.nextOccurrenceAt) : 'no-date';
		const arr = map.get(key) ?? [];
		arr.push(t);
		map.set(key, arr);
	}

	// 3) transforma em array + ordena grupos
	const groups = Array.from(map.entries())
		.map(([key, items]) => ({
			key,
			title: key === 'no-date' ? 'No date' : key.replaceAll('-', '/'),
			date: key === 'no-date' ? null : new Date(`${key}T00:00:00`),
			items,
		}))
		.sort((a, b) => {
			if (a.key === 'no-date') return 1;
			if (b.key === 'no-date') return -1;
			return a.date!.getTime() - b.date!.getTime();
		});

	// 4) ordena dentro do grupo por horário da ocorrência (ou prioridade, etc.)
	for (const g of groups) {
		g.items.sort((a, b) => {
			const ta = a.nextOccurrenceAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
			const tb = b.nextOccurrenceAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
			return ta - tb;
		});
	}

	return groups;
}
