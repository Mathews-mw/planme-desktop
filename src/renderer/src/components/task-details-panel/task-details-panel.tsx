import dayjs from 'dayjs';
import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { toWeekdayObjects } from '../../utils/weekdays-utils';
import { getRecurrenceLabel } from '../../utils/recurrence-utils';
import { useUpdateTask } from '../../hooks/tasks/use-update-task';
import { buildReminderDateTime } from '../../utils/build-reminder-date-time';
import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { subtaskRepository } from '~/src/renderer/repositories/subtasks-repository';
import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';
import { useToggleTaskOccurrenceComplete } from '../../hooks/tasks/use-toggle-task-occurrence-complete';

import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { TaskTitleInput } from './task-title-input';
import { DeleteTaskButton } from './delete-task-button';
import { MoveToListSelect } from './move-to-list-select';
import { SubtaskList } from './subtask-section/subtask-list';
import { PriorityDropdownMenu } from './priority-dropdown-menu';
import { TaskDescriptionInput } from './task-description-input';
import { SelectReminderDialog } from '../select-reminder-dialog';
import { SelectDeadlineDialog } from '../select-deadline-dialog';
import { SelectRecurrenceDialog } from '../select-recurrence-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { ToggleFavoriteTaskButton } from '../task-components/toggle-favorite-task-button';

import { IconCalendarCheck, IconCalendarRepeat, IconCalendarTime, IconNote } from '@tabler/icons-react';

interface IProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	occurrence?: ITaskOccurrenceDetails | null;
}

export function TaskDetailsPanel({ occurrence, open, onOpenChange }: IProps) {
	const [showReminderDialog, setShowReminderDialog] = useState(false);
	const [showDeadlineDialog, setShowDeadlineDialog] = useState(false);
	const [showRecurrenceDialog, setShowRecurrenceDialog] = useState(false);

	const { handleUpdateTask, isPendingUpdate } = useUpdateTask();
	const { handleToggleCompleteOccurrence, isPending: isPendingComplete } = useToggleTaskOccurrenceComplete({
		onSuccess: () => onOpenChange(false),
	});

	const { data: subtasksResponse } = useQuery({
		queryKey: ['subtasks', occurrence?.taskDefinitionId],
		queryFn: () => subtaskRepository.listing({ taskDefinitionId: occurrence?.taskDefinitionId ?? '' }),
		enabled: !!occurrence && open,
	});

	const { data: taskListResponse } = useQuery({
		queryKey: ['task-list', 'edit-task-sheet'],
		queryFn: taskListRepository.listingAll,
		refetchOnWindowFocus: false,
		enabled: open,
	});

	const reminderDt =
		occurrence && occurrence.occurrenceDateTime
			? buildReminderDateTime({
					date: occurrence.occurrenceDateTime,
					hour: occurrence.occurrenceDateTime.getHours().toString(),
					minute: occurrence.occurrenceDateTime.getMinutes().toString(),
				})
			: null;
	const timeLabel = reminderDt ? dayjs(reminderDt).format('h:mm A') : '';
	const dateLabel = reminderDt ? dayjs(reminderDt).format('MMMM D, YYYY') : '';

	const recurrenceLabel = occurrence
		? getRecurrenceLabel({
				frequency: occurrence.taskDefinition.recurrenceRule.frequency,
				dayOfMonth: occurrence.taskDefinition.recurrenceRule.dayOfMonth,
				endDate: occurrence.taskDefinition.recurrenceRule.endDate,
				interval: occurrence.taskDefinition.recurrenceRule.interval,
				maxOccurrences: occurrence.taskDefinition.recurrenceRule.maxOccurrences,
				recurrenceEndType: occurrence.taskDefinition.recurrenceRule.endType,
			})
		: { repetition: 'No recurrence' };

	const weekdaysLabel =
		occurrence &&
		occurrence.taskDefinition.recurrenceRule.weekdays &&
		occurrence.taskDefinition.recurrenceRule.weekdays.length > 0
			? toWeekdayObjects(occurrence.taskDefinition.recurrenceRule.weekdays)
			: null;

	if (!occurrence) {
		return null;
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-105 p-0 sm:w-120">
				<div className="flex h-full flex-col">
					<SheetHeader className="border-b p-4">
						<SheetTitle className="text-muted-foreground">Task details</SheetTitle>
					</SheetHeader>

					<ScrollArea className="flex-1 overflow-auto p-4">
						<div className="space-y-4">
							<div className="flex w-full items-center justify-between">
								<PriorityDropdownMenu
									priority={occurrence.taskDefinition.priority}
									onUpdatePriority={async (priority) =>
										await handleUpdateTask({ taskDefinitionId: occurrence.taskDefinitionId, priority })
									}
								/>

								<ToggleFavoriteTaskButton
									taskDefinition={occurrence.taskDefinition}
									disabled={!!occurrence.completedAt}
									postAction={() => onOpenChange(false)}
								/>
							</div>

							{/* Title Section */}
							<div className="rounded-md border bg-background px-4 py-2 shadow-xs dark:border-input dark:bg-input/30">
								<div className="flex items-center gap-2">
									<Checkbox
										checked={occurrence.status === 'COMPLETED'}
										disabled={isPendingComplete}
										onCheckedChange={() =>
											handleToggleCompleteOccurrence({
												occurrenceId: occurrence.id,
												taskDefinitionId: occurrence.taskDefinitionId,
											})
										}
									/>
									<TaskTitleInput
										occurrence={occurrence}
										onHandleUpdate={handleUpdateTask}
										isPending={isPendingUpdate}
									/>
								</div>
							</div>

							{/* Reminder Section */}
							<div>
								<Button
									variant="outline"
									disabled={!!occurrence.completedAt}
									onClick={() => setShowReminderDialog(true)}
									className="flex h-full w-full justify-start"
								>
									<div className="flex gap-2">
										<IconCalendarTime className="size-5 text-sky-500" />
										<div className="flex flex-col items-start">
											<span className="font-semibold">{`Remind me at ${timeLabel}`}</span>
											<span className="text-muted-foreground">{dateLabel}</span>
										</div>
									</div>
								</Button>

								<SelectReminderDialog
									openDialog={showReminderDialog}
									onOpenDialog={setShowReminderDialog}
									defaultOptions={
										occurrence.taskDefinition.recurrenceRule.startDateTime
											? {
													date: occurrence.taskDefinition.recurrenceRule.startDateTime,
													hour: occurrence.taskDefinition.recurrenceRule.startDateTime.getHours().toString(),
													minute: occurrence.taskDefinition.recurrenceRule.startDateTime.getMinutes().toString(),
												}
											: undefined
									}
									onPickDateTime={(dateTime) => {
										handleUpdateTask({
											taskDefinitionId: occurrence.taskDefinitionId,
											recurrenceRule: {
												startDateTime: new Date(
													dateTime.date.getFullYear(),
													dateTime.date.getMonth(),
													dateTime.date.getDate(),
													parseInt(dateTime.hour),
													parseInt(dateTime.minute)
												),
											},
										});
									}}
								/>
							</div>

							{/* Recurrence Section */}
							<div>
								<Button
									variant="outline"
									disabled={!!occurrence.completedAt}
									onClick={() => setShowRecurrenceDialog(true)}
									className="flex h-full w-full justify-start"
								>
									<div className="flex gap-2">
										<IconCalendarRepeat className="size-5 text-sky-500" />
										<div className="flex flex-col items-start">
											<span className="font-semibold">{recurrenceLabel.repetition}</span>

											{weekdaysLabel && (
												<div>
													{weekdaysLabel.map((weekday, index) => (
														<Fragment key={weekday.value}>
															<span>{weekday.cond}</span>
															{index + 1 !== weekdaysLabel.length && <span className="text-muted-foreground">, </span>}
														</Fragment>
													))}
												</div>
											)}

											{recurrenceLabel.ends && (
												<span className="text-sm text-muted-foreground">{recurrenceLabel.ends}</span>
											)}
										</div>
									</div>
								</Button>

								<SelectRecurrenceDialog
									openDialog={showRecurrenceDialog}
									onOpenDialog={setShowRecurrenceDialog}
									defaultOptions={{
										frequency: occurrence.taskDefinition.recurrenceRule.frequency,
										interval: occurrence.taskDefinition.recurrenceRule.interval ?? undefined,
										endDate: occurrence.taskDefinition.recurrenceRule.endDate ?? undefined,
										recurrenceEndType: occurrence.taskDefinition.recurrenceRule.endType,
										dayOfMonth: occurrence.taskDefinition.recurrenceRule.dayOfMonth ?? undefined,
										weekdays: occurrence.taskDefinition.recurrenceRule.weekdays
											? toWeekdayObjects(occurrence.taskDefinition.recurrenceRule.weekdays)
											: undefined,
										maxOccurrences: occurrence.taskDefinition.recurrenceRule.maxOccurrences ?? undefined,
									}}
									onSaveRecurrence={(data) =>
										handleUpdateTask({
											taskDefinitionId: occurrence.taskDefinitionId,
											recurrenceRule: {
												frequency: data.frequency,
												endType: data.recurrenceEndType,
												interval: data.interval,
												startDateTime: occurrence.taskDefinition.recurrenceRule.startDateTime,
												maxOccurrences: data.maxOccurrences,
												dayOfMonth: data.dayOfMonth,
												weekdays: data.weekdays?.map((w) => w.value),
												endDate: data.endDate,
											},
										})
									}
								/>
							</div>

							{/* Deadline Section */}
							{occurrence.taskDefinition.deadline && (
								<div>
									<Button
										variant="outline"
										onClick={() => setShowDeadlineDialog(true)}
										disabled={!!occurrence.completedAt}
										className="flex h-full w-full justify-start"
									>
										<div className="flex gap-2">
											<IconCalendarCheck className="size-5 text-sky-500" /> Ends on{' '}
											<span className="font-semibold">
												{dayjs(new Date(occurrence.taskDefinition.deadline)).format('MMMM D, YYYY')}
											</span>
										</div>
									</Button>

									<SelectDeadlineDialog
										openDialog={showDeadlineDialog}
										onOpenDialog={setShowDeadlineDialog}
										defaultOptions={
											occurrence.taskDefinition.deadline ? new Date(occurrence.taskDefinition.deadline) : undefined
										}
										onPickDate={(dateTime) => {
											handleUpdateTask({
												taskDefinitionId: occurrence.taskDefinitionId,
												deadline: dateTime,
											});
										}}
									/>
								</div>
							)}

							{/* Subtask Section */}
							<SubtaskList
								disabled={!!occurrence.completedAt}
								taskDefinitionId={occurrence.taskDefinitionId}
								subtasks={subtasksResponse && subtasksResponse.success ? subtasksResponse.data : []}
							/>

							{/* Description Section */}
							{occurrence.taskDefinition.description && (
								<div className="space-y-2 rounded-md border bg-background px-4 py-2 shadow-xs dark:border-input dark:bg-input/30">
									<div className="flex items-center gap-2">
										<IconNote className="size-5 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">Description</span>
									</div>

									<TaskDescriptionInput
										disabled={!!occurrence.completedAt}
										occurrence={occurrence}
										onHandleUpdate={handleUpdateTask}
										isPending={isPendingUpdate}
									/>
								</div>
							)}

							<Separator />

							{/* Task lists section */}
							{taskListResponse && taskListResponse.data && (
								<MoveToListSelect
									disabled={!!occurrence.completedAt}
									taskList={taskListResponse.data}
									defaultValue={occurrence.taskDefinition.listSlug}
									onSelectList={async (listSlug) => {
										await handleUpdateTask({ taskDefinitionId: occurrence.taskDefinitionId, listSlug });
									}}
								/>
							)}
						</div>
					</ScrollArea>

					<div className="flex w-full items-center justify-between border-t p-2">
						<span className="text-sm text-muted-foreground">
							Created at {dayjs(new Date(occurrence.taskDefinition.createdAt)).format('MMMM D, YYYY')}
						</span>

						<DeleteTaskButton
							occurrence={occurrence}
							disabled={!!occurrence.completedAt}
							onCloseSheet={() => onOpenChange(false)}
						/>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
