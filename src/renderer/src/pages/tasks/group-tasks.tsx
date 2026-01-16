import {
	IconCalendarTime,
	IconDotsVertical,
	IconNote,
	IconPointFilled,
	IconRefresh,
	IconStar,
} from '@tabler/icons-react';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

export function GroupTasks() {
	return (
		<div className="flex flex-col gap-2 rounded-lg bg-primary/5 p-2 shadow-xs">
			<span className="font-semibold">Jan 10, 2026</span>
			<ul className="flex w-full flex-1 flex-col space-y-2">
				{Array.from({ length: 4 }).map((_, index) => {
					return (
						<li key={index} className="flex w-full items-baseline justify-between gap-2 rounded-md border p-2">
							<Checkbox className="shrink-0" />

							<div className="flex w-full flex-1 grow flex-col">
								<span className="text-lg font-semibold">Task Title</span>

								<div className="flex items-center gap-1">
									<div className="text-sm text-muted-foreground">
										<span>2 de 5</span>
									</div>

									<IconPointFilled className="size-4 text-muted-foreground" />

									<div className="flex items-center gap-1">
										<IconCalendarTime className="size-4 text-muted-foreground" />
										<span className="text-sm text-sky-500">16:30</span>
									</div>

									<IconPointFilled className="size-4 text-muted-foreground" />

									<IconRefresh className="size-4 text-muted-foreground" />

									<IconPointFilled className="size-4 text-muted-foreground" />

									<IconNote className="size-4 text-muted-foreground" />
								</div>
							</div>

							<div>
								<Button size="icon" variant="ghost">
									<IconStar />
								</Button>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button size="icon" variant="ghost">
											<IconDotsVertical />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuLabel>My Account</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem>Profile</DropdownMenuItem>
										<DropdownMenuItem>Billing</DropdownMenuItem>
										<DropdownMenuItem>Team</DropdownMenuItem>
										<DropdownMenuItem>Subscription</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
