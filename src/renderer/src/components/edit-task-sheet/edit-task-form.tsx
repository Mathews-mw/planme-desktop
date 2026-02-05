import z from 'zod';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { queryClient } from '../../lib/query-client';
import { useAuth } from '../../context/auth-context';
import { ITask, type ITaskList } from '~/src/shared/types/task';
import { errorHandler } from '../../_api/error-handler/error-handler';
import { taskRepository } from '../../../repositories/tasks-repository';
import { type ITaskPriority } from '~/src/shared/types/task-definition';
import type { IRecurrenceEndType, IRecurrenceFrequency } from '~/src/shared/types/recurrence-rule';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { ReminderDialog } from './reminder-dialog';
import { ReminderDropdown } from './reminder-dropdown';
import { RecurrenceDialog } from './recurrence-dialog';
import { RecurrenceDropdown } from './recurrence-dropdown';
import { PickDeadlineDialog } from './pick-deadline-dialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet';

import { Loader2, X } from 'lucide-react';
import { IconCalendarCheck } from '@tabler/icons-react';
import { toWeekdayObjects } from '../../utils/weekdays-utils';

interface IProps {
	task: ITask;
	taskList: ITaskList[];
	onClose: () => void;
}

export interface IDateTime {
	date: Date;
	hour: string;
	minute: string;
}

export interface IRecurrenceData {
	frequency: IRecurrenceFrequency;
	interval?: number;
	dayOfMonth?: number;
	weekdays?: Array<{ value: number; label: string }>;
	recurrenceEndType?: IRecurrenceEndType;
	endDate?: Date;
	maxOccurrences?: number;
}

const formSchema = z.object({
	title: z.string({ error: 'Please, provide a title' }).min(1, { message: 'Please, provide a title' }),
	description: z.optional(z.string()),
	priority: z.string().optional(),
	list: z.string({ error: 'Please, select a list' }).min(1, { message: 'Please, select a list' }),
});

type FormData = z.infer<typeof formSchema>;

export function EditTaskForm({ task, taskList, onClose }: IProps) {
	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: task.taskDefinition.title,
			description: task.taskDefinition.description ?? undefined,
			priority: task.taskDefinition.priority,
			list: task.taskDefinition.listSlug,
		},
	});

	const { user } = useAuth();

	const [showReminderDialog, setShowReminderDialog] = useState(false);
	const [showRecurrenceDialog, setShowRecurrenceDialog] = useState(false);
	const [showPickDeadlineDialog, setShowPickDeadlineDialog] = useState(false);

	const [dateTime, setDateTime] = useState<IDateTime | undefined>(
		task.recurrenceRule.startDateTime
			? {
				date: task.recurrenceRule.startDateTime,
				hour: task.recurrenceRule.startDateTime.getHours().toString(),
				minute: task.recurrenceRule.startDateTime.getMinutes().toString(),
			}
			: undefined
	);
	const [deadline, setDeadline] = useState<Date | undefined>(task.taskDefinition.deadline ?? undefined);
	const [recurrence, setRecurrence] = useState<IRecurrenceData | undefined>({
		frequency: task.recurrenceRule.frequency,
		interval: task.recurrenceRule.interval ?? undefined,
		endDate: task.recurrenceRule.endDate ?? undefined,
		recurrenceEndType: task.recurrenceRule.endType,
		dayOfMonth: task.recurrenceRule.dayOfMonth ?? undefined,
		weekdays: task.recurrenceRule.weekdays ? toWeekdayObjects(task.recurrenceRule.weekdays) : undefined,
		maxOccurrences: task.recurrenceRule.maxOccurrences ?? undefined,
	});

	const { mutateAsync: createTaskFn, isPending } = useMutation({
		mutationFn: taskRepository.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] });
		},
	});

	async function handleCreateTask(data: FormData) {
		try {
			const result = await createTaskFn({
				definition: {
					userId: user?.id,
					listSlug: data.list,
					title: data.title,
					description: data.description ?? null,
					priority: data.priority ? (data.priority as ITaskPriority) : 'NONE',
					deadline: deadline ? new Date(deadline) : null,
				},
				recurrenceRule: {
					startDateTime: dateTime
						? new Date(
							dateTime.date.getFullYear(),
							dateTime.date.getMonth(),
							dateTime.date.getDate(),
							parseInt(dateTime.hour),
							parseInt(dateTime.minute)
						)
						: null,
					frequency: recurrence ? recurrence.frequency : undefined,
					endType: recurrence ? recurrence.recurrenceEndType : undefined,
					interval: recurrence ? recurrence.interval : undefined,
					maxOccurrences: recurrence ? recurrence.maxOccurrences : undefined,
					dayOfMonth: recurrence ? recurrence.dayOfMonth : undefined,
					weekdays: recurrence ? recurrence.weekdays?.map((w) => w.value) : undefined,
					endDate: recurrence ? recurrence.endDate : undefined,
				},
			});

			if (!result.success) {
				errorHandler(result.error);
				return;
			}

			toast.success(`Task "${result.data.taskDefinition.title}" created!`);
			reset();
			setDateTime(undefined);
			setDeadline(undefined);
			setRecurrence(undefined);
			onClose();
		} catch (criticalError) {
			console.error('IPC Communication Crash:', criticalError);
			toast.error('Critical communication error with the system.');
		}
	}

	return (
		<>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Edit Task</SheetTitle>
					<SheetDescription>Edit your task information here.</SheetDescription>
				</SheetHeader>

				<form id="createTask" onSubmit={handleSubmit(handleCreateTask)} className="flex flex-col gap-4 px-4">
					<div className="grid gap-3">
						<Label htmlFor="title">Title</Label>
						<Input id="title" placeholder="Task Title" {...register('title')} />
						{errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
					</div>

					<div className="grid gap-3">
						<Label htmlFor="description">Details</Label>
						<Textarea
							id="description"
							placeholder="Add task details (optional)..."
							rows={4}
							{...register('description')}
						/>
					</div>

					<Separator />

					<div className="flex flex-col gap-2">
						<ReminderDropdown
							dateTime={dateTime}
							onRemoveDateTime={() => setDateTime(undefined)}
							onShowReminderDialog={() => setShowReminderDialog(true)}
						/>

						<RecurrenceDropdown
							recurrenceData={recurrence}
							onShowRecurrenceDialog={() => setShowRecurrenceDialog(true)}
							onRemoveRecurrence={() => setRecurrence(undefined)}
						/>

						{deadline ? (
							<div className="flex items-center justify-between rounded-md bg-secondary p-1 text-sm">
								<Button type="button" variant="ghost" size="sm" onClick={() => setShowPickDeadlineDialog(true)}>
									<IconCalendarCheck className="size-5 text-sky-500" /> Ends on{' '}
									<span className="font-semibold">{dayjs(new Date(deadline)).format('MMMM D, YYYY')}</span>
								</Button>
								<Button type="button" variant="ghost" size="icon-sm" onClick={() => setDeadline(undefined)}>
									<X />
								</Button>
							</div>
						) : (
							<Button type="button" variant="secondary" onClick={() => setShowPickDeadlineDialog(true)}>
								<IconCalendarCheck /> Deadline
							</Button>
						)}
					</div>

					<Separator />

					<div className="space-y-2">
						<Label>Priority</Label>

						<Controller
							control={control}
							name="priority"
							render={({ field }) => {
								return (
									<RadioGroup
										defaultValue="NONE"
										value={field.value}
										onValueChange={field.onChange}
										className="flex gap-3"
									>
										<div className="flex items-center">
											<RadioGroupItem value="NONE" id="NONE" className="peer sr-only" />
											<Label
												htmlFor="NONE"
												className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 transition-colors peer-data-[state=checked]:bg-secondary"
											>
												None
											</Label>
										</div>

										<div className="flex items-center">
											<RadioGroupItem value="LOW" id="LOW" className="peer sr-only" />
											<Label
												htmlFor="LOW"
												className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 transition-colors peer-data-[state=checked]:bg-green-500"
											>
												Low
											</Label>
										</div>

										<div className="flex items-center">
											<RadioGroupItem value="NORMAL" id="NORMAL" className="peer sr-only" />
											<Label
												htmlFor="NORMAL"
												className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 transition-colors peer-data-[state=checked]:bg-sky-500"
											>
												Normal
											</Label>
										</div>

										<div className="flex items-center">
											<RadioGroupItem value="HIGH" id="HIGH" className="peer sr-only" />
											<Label
												htmlFor="HIGH"
												className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 transition-colors peer-data-[state=checked]:bg-amber-500"
											>
												High
											</Label>
										</div>
									</RadioGroup>
								);
							}}
						/>
					</div>

					<Separator />

					<div className="space-y-2">
						<Label htmlFor="list">Add to</Label>

						<Controller
							control={control}
							name="list"
							render={({ field }) => (
								<Select defaultValue="tasks" value={field.value} onValueChange={field.onChange}>
									<SelectTrigger id="list" className="w-full">
										<SelectValue placeholder="Add to list..." />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{taskList.map((list) => {
												return (
													<SelectItem key={list.slug} value={list.slug}>
														{list.title}
													</SelectItem>
												);
											})}
										</SelectGroup>
									</SelectContent>
								</Select>
							)}
						/>

						{errors.list && <small className="text-sm text-red-500">{errors.list.message}</small>}
					</div>
				</form>

				<SheetFooter>
					<Button type="submit" form="createTask" disabled={isPending}>
						{isPending && <Loader2 className="animate-spin" />}
						Save Task
					</Button>
					<SheetClose asChild>
						<Button type="button" variant="outline" disabled={isPending}>
							Close
						</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>

			<ReminderDialog
				openDialog={showReminderDialog}
				onOpenDialog={setShowReminderDialog}
				onPickDateTime={(dateTime) => setDateTime(dateTime)}
			/>
			<RecurrenceDialog
				openDialog={showRecurrenceDialog}
				onOpenDialog={setShowRecurrenceDialog}
				defaultOptions={recurrence}
				onSetRecurrence={(data) => setRecurrence(data)}
			/>
			<PickDeadlineDialog
				openDialog={showPickDeadlineDialog}
				onOpenDialog={setShowPickDeadlineDialog}
				onPickDate={(date) => setDeadline(date)}
			/>
		</>
	);
}
