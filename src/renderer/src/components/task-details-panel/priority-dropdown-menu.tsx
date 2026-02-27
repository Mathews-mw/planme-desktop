import { cn } from '../../lib/utils';
import { type ITaskPriority, taskPrioritiesOptions } from '~/src/shared/types/task-definition';

import { Button } from '../ui/button';
import { badgeVariants } from '../task-components/task-priority-badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface IProps {
	priority: ITaskPriority;
	onUpdatePriority: (status: ITaskPriority) => Promise<void>;
}

export function PriorityDropdownMenu({ priority, onUpdatePriority }: IProps) {
	const label = priority[0] + priority.slice(1).toLowerCase();

	async function handleUpdatePriority(priority: ITaskPriority) {
		await onUpdatePriority(priority);
	}

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button size="sm" className={cn(badgeVariants({ priority }))}>
					{label}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				onCloseAutoFocus={(e) => {
					e.preventDefault();
				}}
			>
				<DropdownMenuGroup>
					{taskPrioritiesOptions.map((option) => {
						return (
							<DropdownMenuItem key={option.value} onSelect={() => handleUpdatePriority(option.value)}>
								{option.label}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
