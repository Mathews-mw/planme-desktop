import { GroupTasks } from './group-tasks';

import { IconSquareRoundedCheckFilled } from '@tabler/icons-react';

export function TasksPage() {
	return (
		<div className="flex flex-col space-y-8">
			<div className="flex items-center gap-2">
				<IconSquareRoundedCheckFilled className="size-7 text-primary" />
				<h1 className="text-xl font-semibold">All Tasks</h1>
			</div>

			<div className="flex flex-1 flex-col gap-4">
				<GroupTasks />
				<GroupTasks />
				<GroupTasks />
				<GroupTasks />
			</div>
		</div>
	);
}
