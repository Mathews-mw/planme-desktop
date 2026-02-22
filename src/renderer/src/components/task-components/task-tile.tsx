import dayjs from 'dayjs';
import React, { useMemo } from 'react';

import { useUpdateTask } from '../../hooks/tasks/use-update-task';
import { useToggleFavoriteTask } from '../../hooks/tasks/use-toggle-favorite-task';
import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { useToggleTaskOccurrenceComplete } from '../../hooks/tasks/use-toggle-task-occurrence-complete';

import { Checkbox } from '../ui/checkbox';
import { ITaskList } from '~/src/shared/types/task';
import { ToggleFavoriteTaskButton } from './toggle-favorite-task-button';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from '../ui/context-menu';

import { TrashIcon } from 'lucide-react';
import {
	IconCalendarTime,
	IconCircleCheck,
	IconNote,
	IconPointFilled,
	IconRefresh,
	IconStar,
	IconStarOff,
} from '@tabler/icons-react';

interface IProps {
	occurrence: ITaskOccurrenceDetails;
	taskList: ITaskList[];
	isActive?: boolean;
	onOpenDetails: (occurrence?: ITaskOccurrenceDetails) => void;
	onRequestDeleteTask: (taskOccurrence: ITaskOccurrenceDetails) => void;
}

function TaskTileComponent({ occurrence, taskList, isActive, onOpenDetails, onRequestDeleteTask }: IProps) {
	const subtasks = occurrence.taskDefinition.subtasks;
	const completedSubtasksCount = useMemo(() => {
		return occurrence.taskDefinition.subtasks.filter((s) => s.completedAt !== null).length;
	}, [occurrence.taskDefinition.subtasks]);

	const { handleUpdateTask } = useUpdateTask();
	const { handleToggleFavoriteTask } = useToggleFavoriteTask();
	const { handleToggleCompleteOccurrence } = useToggleTaskOccurrenceComplete();

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<div
					data-state={isActive ? 'open' : 'close'}
					onClick={() => onOpenDetails(occurrence)}
					className="flex w-full items-baseline justify-between gap-2 rounded-md border bg-card p-2 hover:bg-primary/10 data-[state=open]:bg-primary/10"
				>
					<Checkbox
						className="shrink-0"
						onClick={(e) => e.stopPropagation()}
						onCheckedChange={async () => {
							await handleToggleCompleteOccurrence({
								occurrenceId: occurrence.id,
								taskDefinitionId: occurrence.taskDefinitionId,
							});
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
											{completedSubtasksCount} of {subtasks.length}
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

					<ToggleFavoriteTaskButton taskDefinition={occurrence.taskDefinition} />
				</div>
			</ContextMenuTrigger>

			<ContextMenuContent>
				<ContextMenuGroup>
					<ContextMenuItem
						onSelect={async () => {
							await handleToggleCompleteOccurrence({
								occurrenceId: occurrence.id,
								taskDefinitionId: occurrence.taskDefinitionId,
							});
						}}
					>
						<IconCircleCheck />
						Complete Task
					</ContextMenuItem>
					<ContextMenuItem
						onSelect={async () => {
							await handleToggleFavoriteTask({ taskDefinitionId: occurrence.taskDefinitionId });
						}}
					>
						{occurrence.taskDefinition.isStarred ? (
							<>
								<IconStarOff />
								Remove from favorite
							</>
						) : (
							<>
								<IconStar />
								Mark as favorite
							</>
						)}
					</ContextMenuItem>
				</ContextMenuGroup>
				<ContextMenuSeparator />

				{/* SubMenu */}
				<ContextMenuSub>
					<ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
					<ContextMenuSubContent className="scrollbar-thin max-h-80 overflow-y-auto scrollbar-thumb-background scrollbar-track-transparent">
						<ContextMenuGroup>
							{taskList.map((item) => {
								return (
									<ContextMenuItem
										key={item.id}
										onSelect={async () => {
											await handleUpdateTask({ taskDefinitionId: occurrence.taskDefinitionId, listSlug: item.slug });
										}}
									>
										{item.title}
									</ContextMenuItem>
								);
							})}
						</ContextMenuGroup>
					</ContextMenuSubContent>
				</ContextMenuSub>

				<ContextMenuSeparator />

				<ContextMenuGroup>
					<ContextMenuItem
						variant="destructive"
						onSelect={(e) => {
							e.preventDefault();
							onRequestDeleteTask(occurrence);
						}}
					>
						<TrashIcon />
						Delete
					</ContextMenuItem>
				</ContextMenuGroup>
			</ContextMenuContent>
		</ContextMenu>
	);
}

export const TaskTile = React.memo(TaskTileComponent);
