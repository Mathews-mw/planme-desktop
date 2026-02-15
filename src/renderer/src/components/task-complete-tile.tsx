import dayjs from 'dayjs';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { queryClient } from '../lib/query-client';
import { taskRepository } from '../../repositories/tasks-repository';

import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { EditTaskSheet } from './edit-task-sheet/edit-task-sheet';
import { ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

import { Pen } from 'lucide-react';
import { IconDotsVertical, IconNote, IconPointFilled, IconRefresh, IconStar } from '@tabler/icons-react';

interface IProps {
	occurrence: ITaskOccurrenceDetails;
	isActive?: boolean;
	onOpenDetails: (task: ITaskOccurrenceDetails) => void;
}

export function TaskCompleteTile({ occurrence, isActive, onOpenDetails }: IProps) {
	const [openEditTaskSheet, setOpenEditTaskSheet] = useState(false);
	const [selectedTask, setSelectedTask] = useState<ITaskOccurrenceDetails | undefined>(undefined);

	const subtasks = occurrence.taskDefinition.subtasks;
	const completedSubtasks = subtasks.filter((subtask) => subtask.completedAt !== null);

	const { mutateAsync: toggleCompleteFn } = useMutation({
		mutationFn: taskRepository.toggleComplete,
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ['occurrences'] });
		},
	});

	function handleOpenEditTaskSheet(open: boolean, task?: ITaskOccurrenceDetails) {
		if (open) {
			setOpenEditTaskSheet(true);
			setSelectedTask(task);
		} else {
			setOpenEditTaskSheet(false);
			setSelectedTask(undefined);
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
					checked={occurrence.status === 'COMPLETED'}
					onClick={(e) => e.stopPropagation()}
					onCheckedChange={async (checked) => {
						console.log('checked: ', checked);
						await toggleCompleteFn({ occurrenceId: occurrence.id, taskDefinitionId: occurrence.taskDefinitionId });
					}}
				/>

				<div className="flex w-full flex-1 grow flex-col">
					<span className="text-lg font-semibold text-muted-foreground line-through">
						{occurrence.taskDefinition.title}
					</span>

					<div className="flex items-center gap-1">
						<div className="flex items-center gap-1">
							<div className="flex items-center gap-1">
								<span className="text-sm text-muted-foreground">
									Completed on {dayjs(occurrence.completedAt).format('MMM, DD [at] HH:mm')}
								</span>
							</div>
							<IconPointFilled className="size-4 text-muted-foreground" />
						</div>

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
					<Button
						size="icon"
						variant="ghost"
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<IconStar />
					</Button>

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

			{/* <EditTaskSheet
				task={task}
				open={openEditTaskSheet && selectedTask?.taskDefinition.id === task.taskDefinition.id}
				onOpen={handleOpenEditTaskSheet}
			/> */}
		</>
	);
}
