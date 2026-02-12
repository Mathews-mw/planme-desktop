import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useLoadingBar } from 'react-top-loading-bar';

import { cn } from '../lib/utils';
import { queryClient } from '../lib/query-client';
import { errorHandler } from '../_api/error-handler/error-handler';
import { taskRepository } from '../../repositories/tasks-repository';
import { ITaskDefinition } from '~/src/shared/types/task-definition';

import { Button } from './ui/button';

import { IconStar } from '@tabler/icons-react';

interface IProps {
	taskDefinition: ITaskDefinition;
}

export function ToggleFavoriteTaskButton({ taskDefinition }: IProps) {
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
		},
		onError: (error) => {
			complete();
			console.error('IPC Communication Crash:', error);
			toast.error('Critical communication error with the system.');
		},
	});

	return (
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
	);
}
