import dayjs from 'dayjs';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { queryClient } from '../lib/query-client';
import { TaskFactory } from '../../factories/task-factory';
import { taskRepository } from '../../repositories/tasks-repository';
import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';

import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { EditTaskSheet } from './edit-task-sheet/edit-task-sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import {
	IconCalendarTime,
	IconDotsVertical,
	IconNote,
	IconPointFilled,
	IconRefresh,
	IconStar,
} from '@tabler/icons-react';

import { Pen } from 'lucide-react';
import { ToggleFavoriteTaskButton } from './toggle-favorite-task-button';

interface IProps {
	occurrence: ITaskOccurrenceDetails;
	isActive?: boolean;
	onOpenDetails: (occurrence?: ITaskOccurrenceDetails) => void;
}

export function TaskTile({ occurrence, isActive, onOpenDetails }: IProps) {
	const [openEditTaskSheet, setOpenEditTaskSheet] = useState(false);
	const [selectedOccurrence, setSelectedOccurrence] = useState<ITaskOccurrenceDetails | undefined>(undefined);

	const { mutateAsync: toggleCompleteFn, isPending } = useMutation({
		mutationFn: taskRepository.toggleComplete,
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ['occurrences'] });
		},
	});

	function handleOpenEditTaskSheet(open: boolean, task?: ITaskOccurrenceDetails) {
		if (open) {
			setOpenEditTaskSheet(true);
			setSelectedOccurrence(task);
		} else {
			setOpenEditTaskSheet(false);
			setSelectedOccurrence(undefined);
		}
	}

	return (
		<>
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
						{occurrence.taskDefinition.subtasks && occurrence.taskDefinition.subtasks.length > 0 && (
							<div className="flex items-center gap-1">
								<div className="text-sm text-muted-foreground">
									<span>2 de 5</span>
								</div>

								<IconPointFilled className="size-4 text-muted-foreground" />
							</div>
						)}

						<div className="flex items-center gap-1">
							<div className="flex items-center gap-1">
								<IconCalendarTime className="size-4 text-muted-foreground" />
								<span className="text-sm text-sky-500">
									{dayjs(occurrence.occurrenceDateTime).format('MMM, DD [at] HH:mm')}
								</span>
							</div>
							<IconPointFilled className="size-4 text-muted-foreground" />
						</div>

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
									handleOpenEditTaskSheet(true, occurrence);
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

			<EditTaskSheet
				task={TaskFactory.create({
					taskDefinition: occurrence.taskDefinition,
					recurrenceRule: occurrence.taskDefinition.recurrenceRule,
					occurrences: [],
				})}
				open={openEditTaskSheet && selectedOccurrence?.taskDefinition.id === occurrence.taskDefinition.id}
				onOpen={handleOpenEditTaskSheet}
			/>
		</>
	);
}
