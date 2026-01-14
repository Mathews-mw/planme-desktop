import z from "zod";

export const recurrenceFrequencySchema = z.union([
	z.literal("NONE"),
	z.literal("DAILY_INTERVAL"),
	z.literal("WEEKLY_DAYS"),
	z.literal("MONTHLY_DAY_OF_MONTH"),
	z.literal("YEARLY_INTERVAL"),
]);

export const recurrenceEndTypeSchema = z.union([
	z.literal("ONCE"),
	z.literal("NEVER"),
	z.literal("ON_DATE"),
	z.literal("AFTER_OCCURRENCES"),
]);

export type IRecurrenceFrequency = z.infer<typeof recurrenceFrequencySchema>;
export type IRecurrenceEndType = z.infer<typeof recurrenceEndTypeSchema>;

export interface IRecurrenceRule {
	id: string;
	frequency: IRecurrenceFrequency;
	endType: IRecurrenceEndType;
	startDateTime?: string | null;
	endDate?: string | null;
	interval?: number | null;
	weekdays?: Array<number> | null;
	dayOfMonth?: number | null;
	maxOccurrences?: number | null;
}
