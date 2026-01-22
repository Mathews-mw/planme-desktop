import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { taskRepository } from '~/src/renderer/repositories/tasks-repository';
import { groupAllTasksByNextOccurrenceWithOverdue } from '~/src/shared/helpers/group-all-tasks-by-next-occurrence-with-overdue';

import { GroupTasks } from './group-tasks';

import { IconSquareRoundedCheckFilled } from '@tabler/icons-react';
import { Container } from '../../components/container';
import { TaskTile } from '../../components/task-tile';

export function TasksPage() {
	const [now, setNow] = useState(() => new Date());

	const { data: tasksResponse } = useQuery({ queryKey: ['tasks'], queryFn: taskRepository.listingTasks });

	console.log('tasksResponse: ', tasksResponse);

	const groups = useMemo(() => {
		if (!tasksResponse) {
			return [];
		}

		return groupAllTasksByNextOccurrenceWithOverdue({ tasks: tasksResponse.data, now });
	}, [tasksResponse, now]);

	useEffect(() => {
		// Atualiza a cada 60 segundos
		const id = setInterval(() => setNow(new Date()), 60_000);
		return () => clearInterval(id);
	}, []);

	console.log('groups: ', groups);

	return (
		<div className="flex flex-col space-y-8">
			<div className="flex items-center gap-2">
				<IconSquareRoundedCheckFilled className="size-7 text-primary" />
				<h1 className="text-xl font-semibold">All Tasks</h1>
			</div>

			<div className="space-y-4">
				{groups.map((group) => (
					<Container key={group.key} className="space-y-2">
						<h4
							className={[
								'text-sm font-semibold',
								group.key === 'overdue' ? 'text-rose-500' : 'text-muted-foreground',
							].join(' ')}
						>
							{group.title}
						</h4>

						<ul className="space-y-2">
							{group.items.map((task) => {
								return (
									<li key={task.id}>
										<TaskTile task={task} />
									</li>
								);
							})}
						</ul>
						{/* <ul className="space-y-2">
							{group.items.map((t) => (
								<li key={t.id} className="rounded-md border p-2">
									<div className="flex items-center justify-between">
										<div>
											<div className="font-semibold">{t.taskDefinition.title}</div>
											<div className="text-sm text-muted-foreground">
												{t.nextOccurrenceAt ? t.nextOccurrenceAt.toLocaleString() : 'No scheduled date'}
											</div>
										</div>
									</div>
								</li>
							))}
						</ul> */}
					</Container>
				))}
			</div>
		</div>
	);
}
