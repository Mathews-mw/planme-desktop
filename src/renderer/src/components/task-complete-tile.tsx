import { useState } from 'react';

import { type ITask } from '~/src/shared/types/task';

import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { EditTaskSheet } from './edit-task-sheet/edit-task-sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

import { Pen } from 'lucide-react';
import { IconDotsVertical, IconNote, IconPointFilled, IconRefresh, IconStar } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { taskRepository } from '../../repositories/tasks-repository';
import { queryClient } from '../lib/query-client';

interface IProps {
	task: ITask;
	isActive?: boolean;
	onOpenDetails: (task: ITask) => void;
}

export function TaskCompleteTile({ task, isActive, onOpenDetails }: IProps) {
	const [openEditTaskSheet, setOpenEditTaskSheet] = useState(false);
	const [selectedTask, setSelectedTask] = useState<ITask | undefined>(undefined);

	const { mutateAsync: toggleCompleteFn, isPending } = useMutation({
		mutationFn: taskRepository.toggleComplete,
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] });
		},
	});

	function handleOpenEditTaskSheet(open: boolean, task?: ITask) {
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
				onClick={() => onOpenDetails(task)}
				className="flex w-full items-baseline justify-between gap-2 rounded-md border bg-card p-2 hover:bg-primary/10 data-[state=open]:bg-primary/10"
			>
				<Checkbox
					className="shrink-0"
					checked={task.occurrences[0].status === 'COMPLETED'}
					onClick={(e) => e.stopPropagation()}
					onCheckedChange={async (checked) => {
						console.log('checked: ', checked);
						await toggleCompleteFn({ taskDefinitionId: task.taskDefinition.id });
					}}
				/>

				<div className="flex w-full flex-1 grow flex-col">
					<span className="text-lg font-semibold text-muted-foreground line-through">{task.taskDefinition.title}</span>

					<div className="flex items-center gap-1">
						{task.subtasks && task.subtasks.length > 0 && (
							<div className="flex items-center gap-1">
								<div className="text-sm text-muted-foreground">
									<span>2 de 5</span>
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
									handleOpenEditTaskSheet(true, task);
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
				task={task}
				open={openEditTaskSheet && selectedTask?.taskDefinition.id === task.taskDefinition.id}
				onOpen={handleOpenEditTaskSheet}
			/>
		</>
	);
}
