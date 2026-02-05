import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { taskRepository } from '~/src/renderer/repositories/tasks-repository';

import { TaskTile } from '../../components/task-tile';
import { Container } from '../../components/container';

import { IconSquareRoundedCheckFilled } from '@tabler/icons-react';
import { TaskWithNext } from '~/src/shared/helpers/group-tasks-utilities';
import { TaskDetailsPanel } from '../../components/task-details-panel/task-details-panel';
import { groupOccurrencesByDate } from '~/src/shared/helpers/group-occurrences-by-date';
import { TaskCompleteList } from '../../components/task-complete-list';

export function TasksPage() {
	const [now, setNow] = useState(() => new Date());
	const [selectedTask, setSelectedTask] = useState<TaskWithNext | undefined>();
	const [detailsOpen, setDetailsOpen] = useState(false);

	const [animatedContainer] = useAutoAnimate();
	const [parent] = useAutoAnimate();

	const { data: tasksResponse } = useQuery({
		queryKey: ['tasks', 'status:PENDING'],
		queryFn: async () => taskRepository.listingTasks({ status: 'PENDING' }),
	});

	const groups = useMemo(() => {
		if (!tasksResponse || !tasksResponse.success) {
			return [];
		}

		return groupOccurrencesByDate({ tasks: tasksResponse.data, now });
	}, [tasksResponse, now]);

	function openDetails(task: TaskWithNext) {
		setSelectedTask(task);
		setDetailsOpen(true);
	}

	function closeDetails(open: boolean) {
		setDetailsOpen(open);
		if (!open) setSelectedTask(undefined);
	}

	useEffect(() => {
		// Atualiza a cada 60 segundos
		const id = setInterval(() => setNow(new Date()), 60_000);
		return () => clearInterval(id);
	}, []);

	return (
		<>
			<div ref={animatedContainer} className="flex flex-col space-y-8">
				<div className="flex items-center gap-2">
					<IconSquareRoundedCheckFilled className="size-7 text-primary" />
					<h1 className="text-xl font-semibold">All Tasks</h1>
				</div>

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
										{group.items.map((task) => {
											return (
												<li key={task.taskDefinition.id}>
													<TaskTile
														task={task}
														isActive={detailsOpen && selectedTask?.taskDefinition.id === task.taskDefinition.id}
														onOpenDetails={openDetails}
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

				<TaskCompleteList parentRef={parent} />
			</div>

			<TaskDetailsPanel open={detailsOpen} onOpenChange={closeDetails} task={selectedTask} />
		</>
	);
}
