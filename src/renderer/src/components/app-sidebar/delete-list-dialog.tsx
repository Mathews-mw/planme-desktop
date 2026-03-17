import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';

import { queryClient } from '../../lib/query-client';
import { type ITaskList } from '~/src/shared/types/task';
import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';

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

import { Loader2 } from 'lucide-react';

interface IProps {
	taskList?: ITaskList;
	open: boolean;
	onOpen: (open: boolean) => void;
}

export function DeleteListDialog({ taskList, open, onOpen }: IProps) {
	const { slug: currentSlugLocation } = useParams();

	const router = useNavigate();

	const { mutateAsync: deleteListFn, isPending } = useMutation({
		mutationFn: taskListRepository.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['task-list'] });
		},
	});

	async function handleDeleteList() {
		if (!taskList) {
			return;
		}

		try {
			const result = await deleteListFn({ id: taskList.id });

			if (!result.success) {
				return toast.error('Delete list error', { description: result.error.message });
			}

			onOpen(false);

			if (taskList.slug === currentSlugLocation) {
				router('/tasks/tasks');
			}
		} catch (error) {
			console.error('IPC Communication Crash:', error);
			toast.error('Critical communication error with the system.');
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpen}>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Delete List</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this list? All tasks will be moved to the main list.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" type="button" disabled={isPending}>
							Cancel
						</Button>
					</DialogClose>
					<Button variant="destructive" disabled={isPending} onClick={() => handleDeleteList()}>
						{isPending && <Loader2 className="animate-spin" />}
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
