import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';

import {
	IconCalendarTime,
	IconDotsVertical,
	IconNote,
	IconPointFilled,
	IconRefresh,
	IconStar,
} from '@tabler/icons-react';
import { ITask } from '~/src/shared/types/task';
import dayjs from 'dayjs';
import { TaskWithNext } from '~/src/shared/helpers/group-tasks-utilities';

interface IProps {
	task: TaskWithNext;
}

export function TaskTile({ task }: IProps) {
	return (
		<div className="flex w-full items-baseline justify-between gap-2 rounded-md border bg-card p-2">
			<Checkbox className="shrink-0" />

			<div className="flex w-full flex-1 grow flex-col">
				<span className="text-lg font-semibold">{task.taskDefinition.title}</span>

				<div className="flex items-center gap-1">
					{task.subtasks && task.subtasks.length > 0 && (
						<div className="flex items-center gap-1">
							<div className="text-sm text-muted-foreground">
								<span>2 de 5</span>
							</div>

							<IconPointFilled className="size-4 text-muted-foreground" />
						</div>
					)}

					{task.nextOccurrenceAt && (
						<div className="flex items-center gap-1">
							<div className="flex items-center gap-1">
								<IconCalendarTime className="size-4 text-muted-foreground" />
								<span className="text-sm text-sky-500">{dayjs(task.nextOccurrenceAt).format('HH:mm')}</span>
							</div>
							<IconPointFilled className="size-4 text-muted-foreground" />
						</div>
					)}

					{task.recurrenceRule.frequency !== 'NONE' && task.recurrenceRule.endType !== 'ONCE' && (
						<div className="flex items-center gap-1">
							<IconRefresh className="size-4 text-muted-foreground" />
							<IconPointFilled className="size-4 text-muted-foreground" />
						</div>
					)}

					{task.taskDefinition.description && <IconNote className="size-4 text-muted-foreground" />}
				</div>
			</div>

			<div>
				<Button size="icon" variant="ghost">
					<IconStar />
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="ghost">
							<IconDotsVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Profile</DropdownMenuItem>
						<DropdownMenuItem>Billing</DropdownMenuItem>
						<DropdownMenuItem>Team</DropdownMenuItem>
						<DropdownMenuItem>Subscription</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
