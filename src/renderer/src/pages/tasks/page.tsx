import {
	IconCalendarTime,
	IconDotsVertical,
	IconNote,
	IconNotes,
	IconPoint,
	IconPointFilled,
	IconRefresh,
	IconSquareRoundedCheckFilled,
} from '@tabler/icons-react';
import { Checkbox } from '../../components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { RefreshCcw, StarIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { GroupTasks } from './group-tasks';

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
