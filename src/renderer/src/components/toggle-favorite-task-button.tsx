import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useLoadingBar } from 'react-top-loading-bar';

import { cn } from '../lib/utils';
import { queryClient } from '../lib/query-client';
import { errorHandler } from '../_api/error-handler/error-handler';
import { taskRepository } from '../../repositories/tasks-repository';
import { ITaskDefinition } from '~/src/shared/types/task-definition';

import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import { IconStar } from '@tabler/icons-react';

interface IProps {
	taskDefinition: ITaskDefinition;
	postAction?: () => void;
}

export function ToggleFavoriteTaskButton({ taskDefinition, postAction }: IProps) {
	const { start, complete } = useLoadingBar();

	const { mutateAsync: toggleFavoriteTaskFn } = useMutation({
		mutationFn: async () => {
			start('continuous');
			const result = await taskRepository.toggleFavoriteTask({ taskDefinitionId: taskDefinition.id });

			if (!result.success) {
				errorHandler(result.error);
				complete();
				return;
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['occurrences'] });
			complete();
			postAction?.();
		},
		onError: (error) => {
			complete();
			console.error('IPC Communication Crash:', error);
			toast.error('Critical communication error with the system.');
		},
	});

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					data-favorite={taskDefinition.isStarred}
					onClick={async (e) => {
						e.preventDefault();
						e.stopPropagation();

						await toggleFavoriteTaskFn();
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
