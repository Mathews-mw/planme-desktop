import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { type ITask } from '~/src/shared/types/task';
import { taskRepository } from '../../repositories/tasks-repository';

import { Container } from './container';
import { TaskCompleteTile } from './task-complete-tile';
import autoAnimate from '@formkit/auto-animate';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface TaskCompleteListProps {
	parentRef?: (element: HTMLElement) => void;
}

export function TaskCompleteList({ parentRef }: TaskCompleteListProps) {
	const [show, setShow] = useState(false);
	const [selectedTask, setSelectedTask] = useState<ITask | undefined>();
	const [detailsOpen, setDetailsOpen] = useState(false);

	const [listRef] = useAutoAnimate();

	const { data: tasksResponse } = useQuery({
		queryKey: ['tasks', 'status:COMPLETED'],
		queryFn: async () => taskRepository.listingTasks({ status: 'COMPLETED' }),
	});

	const tasks = useMemo(() => {
		if (!tasksResponse || !tasksResponse.success) {
			return [];
		}

		return tasksResponse.data;
	}, [tasksResponse]);

	function openDetails(task: ITask) {
		setSelectedTask(task);
		setDetailsOpen(true);
	}

	function closeDetails(open: boolean) {
		setDetailsOpen(open);
		if (!open) setSelectedTask(undefined);
	}

	return (
		<>
			{tasksResponse && tasks.length > 0 && (
				<Container>
					<Accordion type="single" collapsible defaultValue="tasks-completed">
						<AccordionItem value="tasks-completed">
							<AccordionTrigger>Completed Tasks</AccordionTrigger>
							<AccordionContent>
								<ul ref={listRef} className="space-y-2">
									{tasks.map((task) => {
										return (
											<li key={task.taskDefinition.id}>
												<TaskCompleteTile
													task={task}
													isActive={detailsOpen && selectedTask?.taskDefinition.id === task.taskDefinition.id}
													onOpenDetails={openDetails}
												/>
											</li>
										);
									})}
								</ul>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</Container>
			)}
		</>
	);
}
