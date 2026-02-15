import dayjs from 'dayjs';
import { Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';

import { toWeekdayObjects } from '../../utils/weekdays-utils';
import { getRecurrenceLabel } from '../../utils/recurrence-utils';
import { buildReminderDateTime } from '../../utils/build-reminder-date-time';
import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { subtaskRepository } from '~/src/renderer/repositories/subtasks-repository';

import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { SubtaskList } from './subtask-list';
import { TaskPriorityBadge } from '../task-priority-badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

import {
	IconCalendarCheck,
	IconCalendarRepeat,
	IconCalendarTime,
	IconNote,
	IconStar,
	IconTrash,
} from '@tabler/icons-react';
import { ScrollArea } from '../ui/scroll-area';

interface IProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	occurrence?: ITaskOccurrenceDetails;
}

export function TaskDetailsPanel({ occurrence, open, onOpenChange }: IProps) {
	const { data: subtasksResponse } = useQuery({
		queryKey: ['subtasks', occurrence?.taskDefinitionId],
		queryFn: () => subtaskRepository.listing({ taskDefinitionId: occurrence?.taskDefinitionId ?? '' }),
		enabled: !!occurrence && open,
	});

	const reminderDt = occurrence
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
						<SheetTitle>{occurrence.taskDefinition.title}</SheetTitle>
					</SheetHeader>

					<ScrollArea className="flex-1 overflow-auto p-4">
						<div className="space-y-4">
							<div className="flex w-full items-center justify-between">
								<TaskPriorityBadge priority={occurrence.taskDefinition.priority} />

								<Button variant="ghost" size="icon-sm">
									<IconStar className="size-5 text-muted-foreground" />
								</Button>
							</div>

							<div className="rounded border bg-background p-2">
								<div className="flex gap-2">
									<IconCalendarTime className="size-5 text-sky-500" />
									<div className="flex flex-col">
										<span className="font-semibold">{`Remind me at ${timeLabel}`}</span>
										<span className="text-muted-foreground">{dateLabel}</span>
									</div>
								</div>
							</div>

							<div className="rounded border bg-background p-2">
								<div className="flex gap-2">
									<IconCalendarRepeat className="size-5 text-sky-500" />
									<div className="flex flex-col">
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
							</div>

							{occurrence.taskDefinition.deadline && (
								<div className="flex items-center gap-2 rounded border bg-background p-2">
									<IconCalendarCheck className="size-5 text-sky-500" /> Ends on{' '}
									<span className="font-semibold">
										{dayjs(new Date(occurrence.taskDefinition.deadline)).format('MMMM D, YYYY')}
									</span>
								</div>
							)}

							<SubtaskList
								taskDefinitionId={occurrence.taskDefinitionId}
								subtasks={subtasksResponse && subtasksResponse.success ? subtasksResponse.data : []}
							/>

							{occurrence.taskDefinition.description && (
								<div className="space-y-2 rounded border bg-background p-2">
									<div className="flex items-center gap-2">
										<IconNote className="size-5 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">Description</span>
									</div>

									<p className="">{occurrence.taskDefinition.description}</p>
								</div>
							)}
						</div>
					</ScrollArea>

					<div className="flex w-full items-center justify-between border-t p-2">
						<span className="text-sm text-muted-foreground">
							Created at {dayjs(new Date(occurrence.taskDefinition.createdAt)).format('MMMM D, YYYY')}
						</span>

						<Button variant="ghost" size="icon-sm">
							<IconTrash className="size-5 text-muted-foreground" />
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
