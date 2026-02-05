import z from 'zod';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';

import { queryClient } from '../../lib/query-client';
import { type ITaskList } from '~/src/shared/types/task';
import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
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

const formSchema = z.object({
	title: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditListDialog({ taskList, open, onOpen }: IProps) {
	const { register, handleSubmit, reset } = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	useEffect(() => {
		if (open && taskList) {
			reset({
				title: taskList.title,
			});
		}
	}, [open, taskList]);

	const { mutateAsync: editListFn, isPending } = useMutation({
		mutationFn: taskListRepository.edit,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['task-list'] });
		},
	});

	async function handleEditList(data: FormData) {
		if (!taskList) {
			return;
		}

		try {
			const result = await editListFn({ id: taskList.id, title: data.title });

			if (!result.success) {
				return toast.error('Edit task list error', { description: result.error.message });
			}

			reset();
			onOpen(false);
		} catch (error) {
			console.error('IPC Communication Crash:', error);
			toast.error('Critical communication error with the system.');
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpen}>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Rename list</DialogTitle>
					<DialogDescription>Rename your task list.</DialogDescription>
				</DialogHeader>
				<form id="edit-list-form" onSubmit={handleSubmit(handleEditList)}>
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label htmlFor="title">List Title</Label>
							<Input id="title" placeholder="New list..." {...register('title')} />
						</div>
					</div>
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" type="button" disabled={isPending}>
							Cancel
						</Button>
					</DialogClose>
					<Button type="submit" form="edit-list-form" disabled={isPending}>
						{isPending && <Loader2 className="animate-spin" />}
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
