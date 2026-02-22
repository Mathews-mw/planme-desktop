import dayjs from 'dayjs';
import React, { useMemo } from 'react';

import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { useToggleTaskOccurrenceComplete } from '../../hooks/tasks/use-toggle-task-occurrence-complete';

import { Checkbox } from '../ui/checkbox';
import { ToggleFavoriteTaskButton } from './toggle-favorite-task-button';

import { IconCalendarTime, IconNote, IconPointFilled, IconRefresh } from '@tabler/icons-react';

interface IProps {
	occurrence: ITaskOccurrenceDetails;
	isActive?: boolean;
	onOpenDetails: (occurrence?: ITaskOccurrenceDetails) => void;
}

function TaskTileCompleteComponent({ occurrence, isActive, onOpenDetails }: IProps) {
	const subtasks = occurrence.taskDefinition.subtasks;
	const completedSubtasksCount = useMemo(() => {
		return occurrence.taskDefinition.subtasks.filter((s) => s.completedAt !== null).length;
	}, [occurrence.taskDefinition.subtasks]);

	const { handleToggleCompleteOccurrence } = useToggleTaskOccurrenceComplete();

	return (
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
				<span className="text-lg font-semibold text-muted-foreground line-through">
					{occurrence.taskDefinition.title}
				</span>

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
		</div>
	);
}

export const TaskTileComplete = React.memo(TaskTileCompleteComponent);
