import z from 'zod';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { toWeekdayObjects, weekDays } from '../utils/weekdays-utils';
import { IRecurrenceEndType, IRecurrenceFrequency } from '~/src/shared/types/recurrence-rule';

import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { DatePicker } from './date-picker';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';

export interface ISelectRecurrenceData {
	frequency: IRecurrenceFrequency;
	interval?: number;
	dayOfMonth?: number;
	weekdays?: Array<{ value: number; label: string }>;
	recurrenceEndType?: IRecurrenceEndType;
	endDate?: Date;
	maxOccurrences?: number;
}

interface IProps {
	openDialog: boolean;
	onOpenDialog: (open: boolean) => void;
	onSaveRecurrence: (data: ISelectRecurrenceData) => Promise<void>;
	defaultOptions?: ISelectRecurrenceData;
}

function toggleNumberInArray(arr: number[], value: number) {
	return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

const formSchema = z
	.object({
		frequency: z
			.enum(['NONE', 'DAILY_INTERVAL', 'WEEKLY_DAYS', 'MONTHLY_DAY_OF_MONTH', 'YEARLY_INTERVAL'])
			.default('NONE'),
		interval: z.coerce.number().int().min(1, { message: 'Interval must be >= 1' }).default(1),
		dayOfMonth: z.coerce.number().int().min(1).max(31).default(1),
		weekdaysSelected: z.array(z.coerce.number().int()).default([]),
		recurrenceEndType: z.enum(['NEVER', 'ONCE', 'ON_DATE', 'AFTER_OCCURRENCES']).default('NEVER'),
		endDate: z.coerce.date().nullable().default(null),
		maxOccurrences: z.coerce.number().int().min(1, { message: 'Must be >= 1' }).nullable().default(null),
	})
	.superRefine((data, ctx) => {
		// Se não repete, não precisa validar resto
		if (data.frequency === 'NONE') return;

		// interval obrigatório apenas para DAILY_INTERVAL e YEARLY_INTERVAL
		if (
			(data.frequency === 'DAILY_INTERVAL' || data.frequency === 'YEARLY_INTERVAL') &&
			(!data.interval || data.interval < 1)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['interval'],
				message: 'Please, provide a valid interval.',
			});
		}

		// dayOfMonth obrigatório apenas para MONTHLY_DAY_OF_MONTH
		if (data.frequency === 'MONTHLY_DAY_OF_MONTH') {
			if (!data.dayOfMonth || data.dayOfMonth < 1 || data.dayOfMonth > 31) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['dayOfMonth'],
					message: 'Please, select a valid day.',
				});
			}
		}

		// weekdays obrigatório para WEEKLY_DAYS
		if (data.frequency === 'WEEKLY_DAYS') {
			if (!data.weekdaysSelected || data.weekdaysSelected.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['weekdaysSelected'],
					message: 'Select at least 1 weekday.',
				});
			}
		}

		// regras de término
		if (data.recurrenceEndType === 'ON_DATE') {
			if (!data.endDate) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['endDate'],
					message: 'Please, select an end date.',
				});
			}
		}

		if (data.recurrenceEndType === 'AFTER_OCCURRENCES') {
			if (!data.maxOccurrences || data.maxOccurrences < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['maxOccurrences'],
					message: 'Please, provide how many occurrences.',
				});
			}
		}
	});

type FormInputData = z.input<typeof formSchema>;
type FormOutputData = z.output<typeof formSchema>; // = z.infer<typeof formSchema>

export function SelectRecurrenceDialog({ onOpenDialog, openDialog, defaultOptions, onSaveRecurrence }: IProps) {
	const {
		control,
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<FormInputData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			frequency: defaultOptions?.frequency ?? 'NONE',
			interval: defaultOptions?.interval ?? 1,
			dayOfMonth: defaultOptions?.dayOfMonth ?? 1,
			weekdaysSelected: defaultOptions?.weekdays ? defaultOptions.weekdays.map((w) => w.value) : [],
			recurrenceEndType: defaultOptions?.recurrenceEndType ?? 'NEVER',
			endDate: defaultOptions?.endDate ?? null,
			maxOccurrences: defaultOptions?.maxOccurrences ?? null,
		},
	});

	const watchedFrequencyValue = useWatch({ control, name: 'frequency' });
	const watchedRecurrenceEndValue = useWatch({
		control,
		name: 'recurrenceEndType',
	});
	const weekdaysSelected = useWatch({
		control,
		name: 'weekdaysSelected',
	}) as number[];

	function handleSelectWeekday(value: number) {
		const next = toggleNumberInArray(weekdaysSelected ?? [], value);
		setValue('weekdaysSelected', next, { shouldValidate: true });
	}

	async function handleSetRecurrence(data: FormInputData) {
		const parsedData: FormOutputData = formSchema.parse(data);

		await onSaveRecurrence({
			frequency: parsedData.frequency,
			interval:
				parsedData.frequency === 'DAILY_INTERVAL' || parsedData.frequency === 'YEARLY_INTERVAL'
					? parsedData.interval
					: undefined,
			dayOfMonth: parsedData.frequency === 'MONTHLY_DAY_OF_MONTH' ? parsedData.dayOfMonth : undefined,
			weekdays:
				parsedData.frequency === 'WEEKLY_DAYS' && parsedData.weekdaysSelected.length > 0
					? toWeekdayObjects(parsedData.weekdaysSelected)
					: undefined,
			recurrenceEndType: parsedData.recurrenceEndType,
			endDate: parsedData.recurrenceEndType === 'ON_DATE' ? (parsedData.endDate ?? undefined) : undefined,
			maxOccurrences:
				parsedData.recurrenceEndType === 'AFTER_OCCURRENCES' ? (parsedData.maxOccurrences ?? undefined) : undefined,
		});

		onOpenDialog(false);
	}

	useEffect(() => {
		if (!openDialog) return;

		if (defaultOptions) {
			reset({
				frequency: defaultOptions.frequency as FormInputData['frequency'],
				interval: defaultOptions.interval ?? 1,
				dayOfMonth: defaultOptions.dayOfMonth ?? 1,
				weekdaysSelected: defaultOptions.weekdays?.map((w) => w.value) ?? [],
				recurrenceEndType: (defaultOptions.recurrenceEndType as FormInputData['recurrenceEndType']) ?? 'NEVER',
				endDate: defaultOptions.endDate ?? null,
				maxOccurrences: defaultOptions.maxOccurrences ?? null,
			});
		} else {
			reset({
				frequency: 'NONE',
				interval: 1,
				dayOfMonth: 1,
				weekdaysSelected: [],
				recurrenceEndType: 'NEVER',
				endDate: null,
				maxOccurrences: null,
			});
		}
	}, [openDialog, defaultOptions, reset]);

	// UX: se mudar frequency para NONE, “desabilita” end type e limpa extras
	useEffect(() => {
		if (!openDialog) return;
		if (watchedFrequencyValue === 'NONE') {
			setValue('recurrenceEndType', 'NEVER');
			setValue('endDate', null);
			setValue('maxOccurrences', null);
			setValue('weekdaysSelected', []);
		}
	}, [watchedFrequencyValue, openDialog, setValue]);

	return (
		<Dialog open={openDialog} onOpenChange={onOpenDialog}>
			<DialogContent className="sm:max-w-92">
				<DialogHeader>
					<DialogTitle>Recurrence</DialogTitle>
					<DialogDescription>Select the desired repetition type.</DialogDescription>
				</DialogHeader>

				<form id="recurrenceForm" onSubmit={handleSubmit(handleSetRecurrence)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="type">Repeat</Label>

						<Controller
							control={control}
							name="frequency"
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger id="type" className="w-full">
										<SelectValue placeholder="Select a frequency" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="NONE">Do not repeat</SelectItem>
											<SelectItem value="DAILY_INTERVAL">Every X days</SelectItem>
											<SelectItem value="WEEKLY_DAYS">On specific weekdays</SelectItem>
											<SelectItem value="MONTHLY_DAY_OF_MONTH">Monthly on day X</SelectItem>
											<SelectItem value="YEARLY_INTERVAL">Every X years</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							)}
						/>
						{errors.frequency?.message && <small className="text-sm text-red-500">{errors.frequency.message}</small>}
					</div>

					{watchedFrequencyValue === 'DAILY_INTERVAL' && (
						<div className="flex items-center gap-2">
							<Label>Repeat every</Label>
							<Input
								type="number"
								inputMode="numeric"
								className="no-spinner w-14"
								{...register('interval', { valueAsNumber: true })}
							/>
							<Label>day(s)</Label>
							{errors.interval?.message && <small className="text-sm text-red-500">{errors.interval.message}</small>}
						</div>
					)}

					{watchedFrequencyValue === 'WEEKLY_DAYS' && (
						<div className="space-y-2">
							<div className="flex justify-between gap-2">
								{weekDays.map((weekday) => (
									<span
										key={weekday.value}
										onClick={() => handleSelectWeekday(weekday.value)}
										data-selected={weekdaysSelected?.includes(weekday.value)}
										className="flex size-8 cursor-pointer items-center justify-center rounded-md bg-secondary px-2 py-1 font-semibold hover:bg-primary data-[selected=true]:bg-primary"
									>
										{weekday.label.slice(0, 1)}
									</span>
								))}
							</div>
							{errors.weekdaysSelected?.message && (
								<small className="text-sm text-red-500">{errors.weekdaysSelected.message}</small>
							)}
						</div>
					)}

					{watchedFrequencyValue === 'MONTHLY_DAY_OF_MONTH' && (
						<div className="flex items-center gap-2">
							<Label>Repeat monthly on day</Label>

							<Controller
								control={control}
								name="dayOfMonth"
								render={({ field }) => (
									<Select value={String(field.value)} onValueChange={field.onChange}>
										<SelectTrigger className="w-18">
											<SelectValue placeholder="Day" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{Array.from({ length: 31 }).map((_, index) => (
													<SelectItem key={index} value={(index + 1).toString()}>
														{index + 1}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								)}
							/>

							{errors.dayOfMonth?.message && (
								<small className="text-sm text-red-500">{errors.dayOfMonth.message}</small>
							)}
						</div>
					)}

					{watchedFrequencyValue === 'YEARLY_INTERVAL' && (
						<div className="flex items-center gap-2">
							<Label>Repeat every</Label>
							<Input
								type="number"
								inputMode="numeric"
								className="no-spinner w-14"
								{...register('interval', { valueAsNumber: true })}
							/>
							<Label>year(s)</Label>
							{errors.interval?.message && <small className="text-sm text-red-500">{errors.interval.message}</small>}
						</div>
					)}

					<Separator />

					<span className="text-sm font-semibold">End of Repetition</span>

					<div className="mt-2 space-y-2">
						<Controller
							control={control}
							name="recurrenceEndType"
							render={({ field }) => (
								<RadioGroup
									value={field.value}
									onValueChange={field.onChange}
									disabled={watchedFrequencyValue === 'NONE'}
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="NEVER" id="NEVER" />
										<Label htmlFor="NEVER">Never</Label>
									</div>

									<div className="flex items-center space-x-2">
										<RadioGroupItem value="ON_DATE" id="ON_DATE" />
										<Label htmlFor="ON_DATE">On Date</Label>

										<div className="w-46">
											<Controller
												control={control}
												name="endDate"
												render={({ field: dateField }) => (
													<DatePicker
														disabled={watchedRecurrenceEndValue !== 'ON_DATE'}
														date={dateField.value ? (dateField.value as Date) : undefined}
														onselectDate={(d) => dateField.onChange(d ?? null)}
													/>
												)}
											/>
										</div>
									</div>

									{errors.endDate?.message && <small className="text-sm text-red-500">{errors.endDate.message}</small>}

									<div className="flex items-center space-x-2">
										<RadioGroupItem value="AFTER_OCCURRENCES" id="AFTER_OCCURRENCES" />
										<Label htmlFor="AFTER_OCCURRENCES" className="flex items-center gap-2">
											After
											<Input
												type="number"
												inputMode="numeric"
												disabled={watchedRecurrenceEndValue !== 'AFTER_OCCURRENCES'}
												className="no-spinner h-8 w-16"
												{...register('maxOccurrences', { valueAsNumber: true })}
											/>
											times
										</Label>
									</div>

									{errors.maxOccurrences?.message && (
										<small className="text-sm text-red-500">{errors.maxOccurrences.message}</small>
									)}
								</RadioGroup>
							)}
						/>
					</div>
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" type="button">
							Cancel
						</Button>
					</DialogClose>

					<Button type="submit" form="recurrenceForm">
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
