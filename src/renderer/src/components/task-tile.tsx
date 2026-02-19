import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';

import { queryClient } from '../lib/query-client';
import { taskRepository } from '../../repositories/tasks-repository';
import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';

import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ToggleFavoriteTaskButton } from './toggle-favorite-task-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

import { Pen } from 'lucide-react';
import { IconCalendarTime, IconDotsVertical, IconNote, IconPointFilled, IconRefresh } from '@tabler/icons-react';

interface IProps {
	occurrence: ITaskOccurrenceDetails;
	isActive?: boolean;
	onOpenDetails: (occurrence?: ITaskOccurrenceDetails) => void;
}

export function TaskTile({ occurrence, isActive, onOpenDetails }: IProps) {
	const subtasks = occurrence.taskDefinition.subtasks;
	const completedSubtasks = subtasks.filter((subtask) => subtask.completedAt !== null);

	const { mutateAsync: toggleCompleteFn } = useMutation({
		mutationFn: taskRepository.toggleComplete,
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ['occurrences'] });
		},
	});

	return (
		<div
			data-state={isActive ? 'open' : 'close'}
			onClick={() => onOpenDetails(occurrence)}
			className="flex w-full items-baseline justify-between gap-2 rounded-md border bg-card p-2 hover:bg-primary/10 data-[state=open]:bg-primary/10"
		>
			<Checkbox
				className="shrink-0"
				onClick={(e) => e.stopPropagation()}
				onCheckedChange={async (_checked) => {
					await toggleCompleteFn({ occurrenceId: occurrence.id, taskDefinitionId: occurrence.taskDefinitionId });
				}}
			/>

			<div className="flex w-full flex-1 grow flex-col">
				<span className="text-lg font-semibold">{occurrence.taskDefinition.title}</span>

				<div className="flex items-center gap-1">
					{occurrence.occurrenceDateTime && (
						<div className="flex items-center gap-1">
							<div className="flex items-center gap-1">
								<IconCalendarTime className="size-4 text-muted-foreground" />
								<span className="text-sm text-sky-500">
									{dayjs(occurrence.occurrenceDateTime).format('MMM, DD [at] HH:mm')}
								</span>
							</div>
							<IconPointFilled className="size-4 text-muted-foreground" />
						</div>
					)}

					{subtasks.length > 0 && (
						<div className="flex items-center gap-1">
							<div className="text-sm text-muted-foreground">
								<span>
									{completedSubtasks.length} de {subtasks.length}
								</span>
							</div>

							<IconPointFilled className="size-4 text-muted-foreground" />
						</div>
					)}

					{occurrence.taskDefinition.recurrenceRule.frequency !== 'NONE' &&
						occurrence.taskDefinition.recurrenceRule.endType !== 'ONCE' && (
							<div className="flex items-center gap-1">
								<IconRefresh className="size-4 text-muted-foreground" />
								<IconPointFilled className="size-4 text-muted-foreground" />
							</div>
						)}

					{occurrence.taskDefinition.description && <IconNote className="size-4 text-muted-foreground" />}
				</div>
			</div>

			<div>
				<ToggleFavoriteTaskButton taskDefinition={occurrence.taskDefinition} />

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size="icon"
							variant="ghost"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<IconDotsVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem
							onSelect={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<Pen /> Edit
						</DropdownMenuItem>
						<DropdownMenuItem>Billing</DropdownMenuItem>
						<DropdownMenuItem>Team</DropdownMenuItem>
						<DropdownMenuItem>Subscription</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
