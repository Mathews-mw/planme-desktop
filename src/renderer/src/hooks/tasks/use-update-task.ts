import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useLoadingBar } from 'react-top-loading-bar';

import { queryClient } from '../../lib/query-client';
import { type IUpdateTaskRequest } from '~/src/shared/types/ipc';
import { errorHandler } from '../../_api/error-handler/error-handler';
import { taskRepository } from '~/src/renderer/repositories/tasks-repository';

interface UseUpdateTaskOptions {
	onSuccess?: () => void;
	onError?: () => void;
}

export function useUpdateTask(options?: UseUpdateTaskOptions) {
	const { start, complete } = useLoadingBar();

	const { mutateAsync: updateFn, isPending: isPendingUpdate } = useMutation({
		mutationFn: taskRepository.update,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['occurrences'] });
		},
	});

	async function handleUpdateTask(data: IUpdateTaskRequest) {
		try {
			start('continuous');

			const result = await updateFn(data);

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
		handleUpdateTask,
		isPendingUpdate,
	};
}
