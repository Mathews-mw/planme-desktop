import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';

import { Button } from '../ui/button';
import { Sheet, SheetTrigger } from '../ui/sheet';
import { CreateTaskForm } from './create-task-form';

import { Plus } from 'lucide-react';

export function CreateTaskSheet() {
	const [openSheet, setOpenSheet] = useState(false);

	const { data: taskListResponse } = useQuery({
		queryKey: ['task-list', 'create-task-sheet'],
		queryFn: taskListRepository.listingAll,
		refetchOnWindowFocus: false,
		enabled: openSheet,
	});

	console.log('taskListResponse: ', taskListResponse);

	return (
		<Sheet open={openSheet} onOpenChange={setOpenSheet}>
			<SheetTrigger asChild>
				<Button variant="secondary" disabled={!taskListResponse} className="hidden sm:flex">
					<Plus /> New Task
				</Button>
			</SheetTrigger>

			<CreateTaskForm taskList={taskListResponse?.data ?? []} onClose={() => setOpenSheet(false)} />
		</Sheet>
	);
}
