import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { useCallback, useMemo, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import type { IpcResponse } from '~/src/shared/types/ipc';
import { useDeleteTaskDialog } from '../../hooks/tasks/use-delete-task-dialog';
import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';
import { occurrencesRepository } from '~/src/renderer/repositories/occurrences-repository';

import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { TaskTile } from '../../components/task-components/task-tile';
import { DeleteTaskDialog } from '../../components/task-components/delete-task-dialog';
import { CompletedTaskList } from '../../components/task-components/completed-tasks-list';
import { TaskDetailsPanel } from '../../components/task-details-panel/task-details-panel';

import { IconArrowNarrowLeft, IconListSearch } from '@tabler/icons-react';

export function OccurrencesByTaskPage() {
	const { taskDefinitionId } = useParams();

	const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string | null>(null);

	const router = useNavigate();
	const [parent] = useAutoAnimate();
	const [animatedContainer] = useAutoAnimate();

	const {
		open: openDeleteTaskDialog,
		taskToDelete,
		requestDelete,
		onOpenChange: deleteDialogOpenChange,
	} = useDeleteTaskDialog();

	const { data: taskListResponse } = useQuery({
		queryKey: ['task-list', 'occurrences-by-task-page'],
		queryFn: taskListRepository.listingAll,
		refetchOnWindowFocus: false,
	});

	const { data: occResponse } = useQuery<IpcResponse<ITaskOccurrenceDetails[]>>({
		queryKey: ['occurrences', 'search_result', taskDefinitionId],
		queryFn: async () =>
			occurrencesRepository.getOccurrencesByTask({
				taskDefinitionId: taskDefinitionId ?? '',
			}),
		enabled: !!taskDefinitionId,
	});

	const group = useMemo(() => {
		if (!occResponse || !occResponse.success) {
			return { title: '', pendingOcc: [], completedOcc: [] };
		}

		const title = occResponse.data[0]?.taskDefinition.title ?? '';

		const pendingOcc = occResponse.data.filter((occ) => occ.status !== 'COMPLETED');
		const completedOcc = occResponse.data.filter((occ) => occ.status === 'COMPLETED');

		return {
			title,
			pendingOcc,
			completedOcc,
		};
	}, [occResponse]);

	const taskList = useMemo(() => {
		if (!taskListResponse) {
			return [];
		}

		return taskListResponse.data;
	}, [taskListResponse]);

	const selectedOccurrence = useMemo(() => {
		if (!selectedOccurrenceId) return null;
		if (!occResponse?.success) return null;

		return occResponse.data.find((occ) => occ.id === selectedOccurrenceId) ?? null;
	}, [selectedOccurrenceId, occResponse]);

	const detailsOpen = selectedOccurrenceId !== null && selectedOccurrence !== null;

	const openDetails = useCallback((occurrence?: ITaskOccurrenceDetails) => {
		if (!occurrence) return;

		setSelectedOccurrenceId(occurrence.id);
	}, []);

	const closeDetails = useCallback((isOpen: boolean) => {
		if (!isOpen) {
			setSelectedOccurrenceId(null);
		}
	}, []);

	return (
		<>
			<div ref={animatedContainer} className="flex flex-col space-y-8">
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<IconListSearch className="size-6 text-primary" />
						{occResponse ? (
							<h1 className="text-muted-foreground">Result for: {group.title}</h1>
						) : (
							<Skeleton className="h-4 w-80" />
						)}
					</div>

					<Button variant="ghost" onClick={() => router('/tasks/tasks')}>
						<IconArrowNarrowLeft /> Back
					</Button>
				</div>

				<div className="space-y-4">
					<ul ref={parent} className="space-y-2">
						{group.pendingOcc.map((occurrence) => {
							return (
								<li key={occurrence.id}>
									<TaskTile
										occurrence={occurrence}
										taskList={taskList}
										isActive={detailsOpen && selectedOccurrenceId === occurrence.id}
										onOpenDetails={openDetails}
										onRequestDeleteTask={(taskOccurrence) =>
											requestDelete({
												taskDefinitionId: taskOccurrence.taskDefinitionId,
												title: taskOccurrence.taskDefinition.title,
											})
										}
									/>
								</li>
							);
						})}
					</ul>
				</div>

				<CompletedTaskList completedOccurrences={group.completedOcc} />
			</div>

			<TaskDetailsPanel open={detailsOpen} onOpenChange={closeDetails} occurrence={selectedOccurrence} />
			<DeleteTaskDialog
				task={taskToDelete}
				open={openDeleteTaskDialog}
				onOpenChange={deleteDialogOpenChange}
				isUndoAction
				postAction={() => {
					// Fechar o painel de detalhes após deletar a task ativa
					const isDeletingActive =
						selectedOccurrence?.taskDefinitionId &&
						taskToDelete?.taskDefinitionId &&
						selectedOccurrence.taskDefinitionId === taskToDelete.taskDefinitionId;

					if (isDeletingActive) setSelectedOccurrenceId(null);
				}}
			/>
		</>
	);
}
