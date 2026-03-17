import z from 'zod';
import { AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { IpcResponse } from '~/src/shared/types/ipc';
import { useDeleteTaskDialog } from '../../hooks/tasks/use-delete-task-dialog';
import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';
import { groupOccurrencesByDate } from '~/src/shared/helpers/group-occurrences-by-date';
import { occurrencesRepository } from '~/src/renderer/repositories/occurrences-repository';

import { NoTasks } from './no-tasks';
import { NoStarredTasks } from './no-starred-tasks';
import { Container } from '../../components/container';
import { AllTasksCompleted } from './all-tasks-completed';
import { FavoriteTasksFilter } from './favorite-tasks-filter';
import { TaskTile } from '../../components/task-components/task-tile';
import { DeleteTaskDialog } from '../../components/task-components/delete-task-dialog';
import { CompletedTaskList } from '../../components/task-components/completed-tasks-list';
import { TaskDetailsPanel } from '../../components/task-details-panel/task-details-panel';

import { IconSquareRoundedCheckFilled } from '@tabler/icons-react';

export function TasksPage() {
	const { slug: listSlug } = useParams();
	const [searchParams] = useSearchParams();

	const isStarredParams = z.coerce.boolean().parse(searchParams.get('isStarred') ?? false);

	const [now, setNow] = useState(() => new Date());
	const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string | null>(null);

	const [parent] = useAutoAnimate();
	const [animatedContainer] = useAutoAnimate();

	const {
		open: openDeleteTaskDialog,
		taskToDelete,
		requestDelete,
		onOpenChange: deleteDialogOpenChange,
	} = useDeleteTaskDialog();

	const { data: taskListResponse } = useQuery({
		queryKey: ['task-list', 'tasks-page'],
		queryFn: taskListRepository.listingAll,
		refetchOnWindowFocus: false,
	});

	const { data: currentListSlug } = useQuery({
		queryKey: ['task-list', listSlug],
		queryFn: async () => await taskListRepository.getBySlug({ slug: listSlug ?? '' }),
		enabled: !!listSlug,
	});

	const { data: occResponse } = useQuery<IpcResponse<ITaskOccurrenceDetails[]>>({
		queryKey: [
			'occurrences',
			'status:PENDING',
			`include_all:${listSlug && listSlug === 'tasks' ? true : false}`,
			listSlug,
			`starred:${isStarredParams}`,
		],
		queryFn: async () =>
			occurrencesRepository.listingOccurrences({
				status: 'PENDING',
				listSlug: listSlug,
				isStarred: isStarredParams,
				includeAllLists: listSlug && listSlug === 'tasks' ? true : false,
			}),
	});

	const { data: completedOccsResponse } = useQuery({
		queryKey: ['occurrences', 'status:COMPLETED', listSlug],
		queryFn: async () =>
			occurrencesRepository.listingOccurrences({ listSlug, status: 'COMPLETED', orderBy: 'recently_completed' }),
	});

	const groups = useMemo(() => {
		if (!occResponse || !occResponse.success) {
			return [];
		}

		const group = groupOccurrencesByDate({ occurrences: occResponse.data, now });

		return group;
	}, [occResponse, now]);

	const completedOccurrences = useMemo(() => {
		if (!completedOccsResponse || !completedOccsResponse.success) {
			return [];
		}

		return completedOccsResponse.data;
	}, [completedOccsResponse]);

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

	useEffect(() => {
		// Atualiza a cada 60 segundos
		const id = setInterval(() => setNow(new Date()), 60_000);
		return () => clearInterval(id);
	}, []);

	return (
		<>
			<div ref={animatedContainer} className="flex flex-col space-y-8">
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<IconSquareRoundedCheckFilled className="size-7 text-primary" />
						<h1 className="text-xl font-semibold">
							{currentListSlug && currentListSlug.success ? currentListSlug.data.title : 'All Tasks'}
						</h1>
					</div>

					{(groups.length > 0 || isStarredParams) && <FavoriteTasksFilter />}
				</div>

				<AnimatePresence>
					{groups.length === 0 && completedOccurrences.length === 0 && !isStarredParams && <NoTasks />}
				</AnimatePresence>

				<AnimatePresence>{isStarredParams && groups.length === 0 && <NoStarredTasks />}</AnimatePresence>

				<AnimatePresence>
					{groups.length === 0 && completedOccurrences.length > 0 && !isStarredParams && <AllTasksCompleted />}
				</AnimatePresence>

				<div className="space-y-4">
					{groups.map((group) => (
						<ul key={group.key}>
							<li>
								<Container className="space-y-2">
									<h4
										className={[
											'text-sm font-semibold',
											group.key === 'overdue' ? 'text-rose-500' : 'text-muted-foreground',
										].join(' ')}
									>
										{group.title}
									</h4>

									<ul ref={parent} className="space-y-2">
										{group.items.map((occurrence) => {
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
								</Container>
							</li>
						</ul>
					))}
				</div>

				{completedOccurrences.length > 0 && <CompletedTaskList completedOccurrences={completedOccurrences} />}
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
