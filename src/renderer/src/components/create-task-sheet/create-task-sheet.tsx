import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';

import { Button } from '../ui/button';
import { Sheet, SheetTrigger } from '../ui/sheet';
import { CreateTaskForm } from './create-task-form';

import { Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Kbd, KbdGroup } from '../ui/kbd';

export function CreateTaskSheet() {
	const [openSheet, setOpenSheet] = useState(false);

	const { data: taskListResponse } = useQuery({
		queryKey: ['task-list', 'create-task-sheet'],
		queryFn: taskListRepository.listingAll,
		refetchOnWindowFocus: false,
		enabled: openSheet,
	});

	return (
		<Sheet open={openSheet} onOpenChange={setOpenSheet}>
			<Tooltip>
				<TooltipTrigger asChild>
					<SheetTrigger asChild>
						<Button variant="secondary" className="hidden sm:flex">
							<Plus /> New Task
						</Button>
					</SheetTrigger>
				</TooltipTrigger>
				<TooltipContent className="pr-1.5">
					<div className="flex items-center gap-2">
						Add new task{' '}
						<KbdGroup>
							<Kbd>Ctrl</Kbd>
							<span>+</span>
							<Kbd>T</Kbd>
						</KbdGroup>
					</div>
				</TooltipContent>
			</Tooltip>

			<CreateTaskForm taskList={taskListResponse?.data ?? []} onClose={() => setOpenSheet(false)} />
		</Sheet>
	);
}
