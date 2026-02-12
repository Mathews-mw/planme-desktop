import dayjs from 'dayjs';

import { Button } from '../ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { X } from 'lucide-react';
import { IconAlarm, IconCalendarClock } from '@tabler/icons-react';
import { IDateTime } from './create-task-form';
import { buildReminderDateTime } from '../../utils/build-reminder-date-time';

interface IProps {
	dateTime: IDateTime | undefined;
	onRemoveDateTime: () => void;
	onShowReminderDialog: (value: boolean) => void;
}

export function ReminderDropdown({ dateTime, onRemoveDateTime, onShowReminderDialog }: IProps) {
	const reminderDt = dateTime ? buildReminderDateTime(dateTime) : null;

	const timeLabel = reminderDt ? dayjs(reminderDt).format('h:mm A') : '';
	const dateLabel = reminderDt ? dayjs(reminderDt).format('MMMM D, YYYY') : '';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{dateTime ? (
					<div className="relative z-0 flex gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
						<IconAlarm className="size-5 text-sky-500" />
						<div className="flex flex-col">
							<span className="font-semibold">{`Remind me at ${timeLabel}`}</span>
							<span className="text-muted-foreground">{dateLabel}</span>
						</div>

						<Button
							variant="ghost"
							type="button"
							size="icon-sm"
							className="absolute top-0 right-1 z-10"
							aria-label="Remove reminder"
							onPointerDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onMouseDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onClick={() => {
								onRemoveDateTime();
							}}
						>
							<X />
						</Button>
					</div>
				) : (
					<Button variant="secondary">
						<IconAlarm /> Reminder me
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem>
					Tomorrow
					<DropdownMenuShortcut>(dom, 19:43)</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					Next Week
					<DropdownMenuShortcut>(Jan 17, 19:45)</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => onShowReminderDialog(true)}>
					<IconCalendarClock />
					Choose a date and time
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
