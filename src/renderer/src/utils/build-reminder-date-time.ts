export interface IDateTime {
	date: Date;
	hour: string;
	minute: string;
}

export function buildReminderDateTime(dateTime: NonNullable<IDateTime>) {
	return new Date(
		dateTime.date.getFullYear(),
		dateTime.date.getMonth(),
		dateTime.date.getDate(),
		Number(dateTime.hour),
		Number(dateTime.minute),
		0,
		0
	);
}
