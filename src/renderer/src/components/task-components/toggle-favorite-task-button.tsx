import { cn } from '../../lib/utils';
import { type ITaskDefinition } from '~/src/shared/types/task-definition';
import { useToggleFavoriteTask } from '../../hooks/tasks/use-toggle-favorite-task';

import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

import { IconStar } from '@tabler/icons-react';

interface IProps {
	taskDefinition: ITaskDefinition;
	postAction?: () => void;
	disabled?: boolean;
}

export function ToggleFavoriteTaskButton({ taskDefinition, postAction, disabled = false }: IProps) {
	const { handleToggleFavoriteTask } = useToggleFavoriteTask({ onSuccess: () => postAction?.() });

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					data-favorite={taskDefinition.isStarred}
					disabled={disabled}
					onClick={async (e) => {
						e.preventDefault();
						e.stopPropagation();

						await handleToggleFavoriteTask({ taskDefinitionId: taskDefinition.id });
					}}
				>
					<IconStar
						className={cn(
							'size text-muted-foreground transition-all duration-200',
							taskDefinition.isStarred && 'fill-primary text-primary'
						)}
					/>
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>{taskDefinition.isStarred ? 'Remove from favorites' : 'Mark as favorite'}</p>
			</TooltipContent>
		</Tooltip>
	);
}
