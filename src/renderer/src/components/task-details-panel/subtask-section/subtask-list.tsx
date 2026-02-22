import { toast } from 'sonner';
import { useRef, useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLoadingBar } from 'react-top-loading-bar';
import { AnimatePresence, motion, Reorder } from 'motion/react';

import { cn } from '../../../lib/utils';
import { IpcResponse } from '~/src/shared/types/ipc';
import { queryClient } from '../../../lib/query-client';
import { ISubtask } from '~/src/shared/types/subtask';
import { errorHandler } from '../../../_api/error-handler/error-handler';
import { subtaskRepository } from '~/src/renderer/repositories/subtasks-repository';

import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { EditSubtaskInput } from './edit-subtask-input';

import { IconPlus, IconSubtask, IconTrash } from '@tabler/icons-react';

interface IProps {
	taskDefinitionId: string;
	subtasks: Array<ISubtask>;
	disabled?: boolean;
}

export function SubtaskList({ taskDefinitionId, subtasks, disabled = false }: IProps) {
	const [inputValue, setInputValue] = useState('');
	const [enableInput, setEnableInput] = useState(false);

	const { start, complete } = useLoadingBar();
	const inputRef = useRef<HTMLInputElement>(null);

	const { mutateAsync: createSubtaskFn, isPending } = useMutation({
		mutationFn: subtaskRepository.create,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['subtasks', taskDefinitionId] });
			await queryClient.invalidateQueries({ queryKey: ['occurrences'] });
		},
	});

	const { mutateAsync: toggleCompleteFn, isPending: isPendingComplete } = useMutation({
		mutationFn: subtaskRepository.toggleComplete,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['subtasks', taskDefinitionId] });
			await queryClient.invalidateQueries({ queryKey: ['occurrences'] });
		},
	});

	const { mutateAsync: updateFn, isPending: isPendingUpdate } = useMutation({
		mutationFn: subtaskRepository.update,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['subtasks', taskDefinitionId] });
		},
	});

	const { mutateAsync: deleteFn, isPending: isPendingDelete } = useMutation({
		mutationFn: subtaskRepository.delete,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['subtasks', taskDefinitionId] });
			await queryClient.invalidateQueries({ queryKey: ['occurrences'] });
		},
	});

	const { mutateAsync: reorderFn } = useMutation({
		mutationFn: subtaskRepository.reorder,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['subtasks', taskDefinitionId] });
		},
	});

	async function handleAddSubtask() {
		if (inputValue.trim() === '') {
			setEnableInput(false);
			return;
		}

		try {
			start('continuous');

			const result = await createSubtaskFn({ title: inputValue, taskDefinitionId });

			if (!result.success) {
				errorHandler(result.error);
				complete();
				return;
			}
		} catch (criticalError) {
			console.error('IPC Communication Crash:', criticalError);
			toast.error('Critical communication error with the system.');
		} finally {
			complete();
		}

		setEnableInput(false);
		setInputValue('');
	}

	async function handleEditTask({ subtaskId, title }: { subtaskId: string; title: string }) {
		try {
			start('continuous');

			const result = await updateFn({ subtaskId, title });

			if (!result.success) {
				errorHandler(result.error);
				complete();
				return;
			}
		} catch (criticalError) {
			console.error('IPC Communication Crash:', criticalError);
			toast.error('Critical communication error with the system.');
		} finally {
			complete();
		}
	}

	async function handleToggleComplete(subtaskId: string) {
		try {
			start('continuous');

			const result = await toggleCompleteFn({ subtaskId });

			if (!result.success) {
				errorHandler(result.error);
				complete();
				return;
			}
		} catch (criticalError) {
			console.error('IPC Communication Crash:', criticalError);
			toast.error('Critical communication error with the system.');
		} finally {
			complete();
		}
	}

	async function handleDelete(subtaskId: string) {
		try {
			start('continuous');

			const result = await deleteFn({ subtaskId });

			if (!result.success) {
				errorHandler(result.error);
				complete();
				return;
			}
		} catch (criticalError) {
			console.error('IPC Communication Crash:', criticalError);
			toast.error('Critical communication error with the system.');
		} finally {
			complete();
		}
	}

	async function handleReorder(subtasks: Array<ISubtask>) {
		const previousData = queryClient.getQueryData<IpcResponse<ISubtask[]>>(['subtasks', taskDefinitionId]);

		queryClient.setQueryData<IpcResponse<ISubtask[]>>(['subtasks', taskDefinitionId], (oldData) => {
			if (!oldData || !oldData.success) return oldData;

			return {
				...oldData,
				data: subtasks,
			};
		});

		try {
			start('continuous');

			const orderedSubtaskIds = subtasks.map((s) => s.id);

			const result = await reorderFn({ orderedSubtaskIds, taskDefinitionId });

			if (!result.success) {
				errorHandler(result.error);
				queryClient.setQueryData(['subtasks', taskDefinitionId], previousData);
				complete();
				return;
			}
		} catch (criticalError) {
			console.error('IPC Communication Crash:', criticalError);
			queryClient.setQueryData(['subtasks', taskDefinitionId], previousData);
			toast.error('Critical communication error with the system.');
		} finally {
			complete();
		}
	}

	useEffect(() => {
		if (enableInput) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 160);
		}
	}, [enableInput]);

	return (
		<div className="rounded-md border bg-background px-4 py-2 shadow-xs dark:border-input dark:bg-input/30">
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<IconSubtask className="size-5 text-sky-500" />
					<span>Subtasks</span>
				</div>

				<Button
					variant="ghost"
					size="sm"
					disabled={disabled || isPending || isPendingComplete || isPendingDelete}
					onClick={() => setEnableInput(true)}
					className="text-primary hover:text-primary"
				>
					<IconPlus /> Add subtask
				</Button>
			</div>

			<Reorder.Group
				as="ul"
				values={subtasks}
				onReorder={(items) => handleReorder(items)}
				className="space-y-2 divide-y"
			>
				{subtasks.map((subtask) => {
					return (
						<Reorder.Item
							as="li"
							key={subtask.id}
							value={subtask}
							whileDrag={{ cursor: 'grabbing' }}
							className="flex w-full cursor-grab items-center justify-between"
						>
							<div className="flex items-center gap-2">
								<Checkbox
									checked={subtask.isCompleted}
									disabled={disabled || isPendingComplete}
									onCheckedChange={() => handleToggleComplete(subtask.id)}
								/>
								<EditSubtaskInput
									subtask={subtask}
									disabled={disabled}
									onHandleUpdate={handleEditTask}
									isPending={isPendingUpdate}
								/>
							</div>

							<div>
								<Button
									variant="ghost"
									size="icon-sm"
									disabled={disabled || isPendingDelete}
									onClick={() => handleDelete(subtask.id)}
									className="text-muted-foreground"
								>
									<IconTrash />
								</Button>
							</div>
						</Reorder.Item>
					);
				})}
			</Reorder.Group>

			<AnimatePresence initial={false}>
				{enableInput ? (
					<motion.div
						initial={{ opacity: 0, scale: 0 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0 }}
						key="box"
						className="flex items-center gap-2"
					>
						<Checkbox disabled />
						<input
							ref={inputRef}
							disabled={isPending}
							placeholder="Subtask title..."
							onBlur={async () => await handleAddSubtask()}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={async (e) => {
								if (e.key === 'Enter') {
									await handleAddSubtask();
								}
							}}
							className={cn([
								'h-9 w-full border-b border-input bg-transparent text-sm outline-none placeholder:text-muted-foreground',
								'focus-visible:border-ring',
							])}
						/>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
