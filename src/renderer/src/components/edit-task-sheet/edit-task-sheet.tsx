import { useQuery } from '@tanstack/react-query';

import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';

import { Sheet } from '../ui/sheet';
import { EditTaskForm } from './edit-task-form';

import { ITask } from '~/src/shared/types/task';

interface IProps {
	task: ITask;
	open: boolean;
	onOpen: (open: boolean) => void;
}

export function EditTaskSheet({ task, open, onOpen }: IProps) {
	const { data: taskListResponse } = useQuery({
		queryKey: ['task-list', 'edit-task-sheet'],
		queryFn: taskListRepository.listingAll,
		refetchOnWindowFocus: false,
		enabled: open,
	});

	return (
		<Sheet open={open} onOpenChange={onOpen}>
			<EditTaskForm task={task} taskList={taskListResponse?.data ?? []} onClose={() => onOpen(false)} />
		</Sheet>
	);
}
