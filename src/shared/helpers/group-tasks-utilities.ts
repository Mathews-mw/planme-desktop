import { ITask } from '../types/task';

export type GroupTasksKey = 'overdue' | 'no-date' | string; // string = YYYY-MM-DD

export type TaskWithNext = ITask & {
	nextOccurrenceAt: Date | null;
};

export function parseIso(v?: Date | string | null) {
	if (!v) return null;
	const d = new Date(v);
	return Number.isNaN(d.getTime()) ? null : d;
}

export function dayKeyLocal(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

export function groupTitle(key: GroupTasksKey) {
	if (key === 'overdue') return 'Overdue';
	if (key === 'no-date') return 'No date';
	return key.replaceAll('-', '/');
}
