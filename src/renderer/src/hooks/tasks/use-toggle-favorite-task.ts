import { toast } from 'sonner';
import { useLoadingBar } from 'react-top-loading-bar';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { errorHandler } from '../../_api/error-handler/error-handler';
import { taskRepository } from '~/src/renderer/repositories/tasks-repository';

interface ToggleTaskOccurrenceCompleteInput {
	taskDefinitionId: string;
}

interface IOptions {
	onSuccess?: () => void;
	onError?: () => void;
}

export function useToggleFavoriteTask(options?: IOptions) {
	const queryClient = useQueryClient();
	const { start, complete } = useLoadingBar();

	const { mutateAsync: toggleFavoriteTaskFn, isPending: isPendingToggleFavorite } = useMutation({
		mutationFn: taskRepository.toggleFavoriteTask,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['occurrences'] });
		},
	});

	async function handleToggleFavoriteTask(data: ToggleTaskOccurrenceCompleteInput) {
		try {
			start('continuous');

			const result = await toggleFavoriteTaskFn({ taskDefinitionId: data.taskDefinitionId });

			if (!result.success) {
				errorHandler(result.error);
				complete();
				options?.onError?.();
				return;
			}

			complete();
			options?.onSuccess?.();
		} catch (criticalError) {
			complete();
			console.error('IPC Communication Crash:', criticalError);
			toast.error('Critical communication error with the system.');
			options?.onError?.();
		}
	}

	return {
		handleToggleFavoriteTask,
		isPendingToggleFavorite,
	};
}
