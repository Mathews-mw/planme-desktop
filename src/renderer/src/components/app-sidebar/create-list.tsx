import z from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';

import { queryClient } from '../../lib/query-client';
import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog';

import { Loader2, Plus } from 'lucide-react';

const formSchema = z.object({
	title: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateList() {
	const { register, handleSubmit, reset } = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	const [open, setOpen] = useState(false);

	const { mutateAsync: createListFn, isPending } = useMutation({
		mutationFn: taskListRepository.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['task-list'] });
		},
	});

	async function handleCreateList(data: FormData) {
		try {
			console.log('form data: ', data);
			const result = await createListFn({ title: data.title });

			if (!result.success) {
				return toast.error('Create list error', { description: result.error.message });
			}

			reset();
			setOpen(false);
		} catch (error) {
			console.error('IPC Communication Crash:', error);
			toast.error('Critical communication error with the system.');
		}
	}

	return (
		<>
			<SidebarGroup className="mt-auto">
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton tooltip="New list" onClick={() => setOpen(true)} className="cursor-pointer">
								<Plus /> New list
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-106.25">
					<DialogHeader>
						<DialogTitle>Create a new list</DialogTitle>
						<DialogDescription>Create a new list to better organize your tasks.</DialogDescription>
					</DialogHeader>
					<form id="create-list-form" onSubmit={handleSubmit(handleCreateList)}>
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
						<Button type="submit" form="create-list-form" disabled={isPending}>
							{isPending && <Loader2 className="animate-spin" />}
							Save list
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
