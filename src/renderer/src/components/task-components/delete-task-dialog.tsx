import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useLoadingBar } from 'react-top-loading-bar';

import { queryClient } from '../../lib/query-client';
import { taskRepository } from '../../../repositories/tasks-repository';

import { Button } from '../ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog';

type DeleteTaskDialogInput = {
	taskDefinitionId: string;
	title: string;
};

interface IProps {
	task?: DeleteTaskDialogInput;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isUndoAction?: boolean;
	postAction?: () => Promise<void> | void;
}

export function DeleteTaskDialog({ task, open, onOpenChange, isUndoAction = false, postAction }: IProps) {
	const { start, complete } = useLoadingBar();

	const { mutateAsync: deleteTaskFn, isPending } = useMutation({
		mutationFn: taskRepository.delete,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['occurrences'] });
		},
	});

	const { mutateAsync: recreateTaskFn } = useMutation({
		mutationFn: taskRepository.recreate,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['occurrences'] });
		},
	});

	async function handleDeleteTask() {
		if (!task) return null;

		start('continuous');

		try {
			const result = await deleteTaskFn({ taskDefinitionId: task.taskDefinitionId });

			if (!result.success) {
				toast.error('Failed to delete the task. Please try again.');
				return;
			}

			onOpenChange(false);

			toast('Task was deleted successfully.', {
				description: `The task "${task.title}" has been removed from your list.`,
				action: isUndoAction
					? {
							label: 'Undo',
							onClick: async () => await recreateTaskFn({ task: result.data }),
						}
					: undefined,
			});

			await postAction?.();
		} catch (error) {
			console.log('Error deleting task:', error);
		} finally {
			complete();
		}
	}

	if (!task) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you sure you want to delete the task?</DialogTitle>
					<DialogDescription>
						<strong>"{task.title}"</strong> will be deleted. Do you wish to proceed with this action?
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={isPending}>
							Cancel
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={handleDeleteTask} disabled={isPending}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
