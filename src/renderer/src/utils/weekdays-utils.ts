export const weekDays = [
	{ value: 1, label: 'Monday', short: 'M', cond: 'Mon' },
	{ value: 2, label: 'Tuesday', short: 'T', cond: 'Tue' },
	{ value: 3, label: 'Wednesday', short: 'W', cond: 'Wed' },
	{ value: 4, label: 'Thursday', short: 'T', cond: 'Thu' },
	{ value: 5, label: 'Friday', short: 'F', cond: 'Fri' },
	{ value: 6, label: 'Saturday', short: 'S', cond: 'Sat' },
	{ value: 7, label: 'Sunday', short: 'S', cond: 'Sun' },
] as const;

export function toWeekdayObjects(values: number[]) {
	return values.map((v) => weekDays.find((w) => w.value === v)).filter(Boolean) as Array<(typeof weekDays)[number]>;
}
