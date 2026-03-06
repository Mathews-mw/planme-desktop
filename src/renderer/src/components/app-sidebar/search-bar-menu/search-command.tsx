import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ITaskDefinition } from '~/src/shared/types/task-definition';

import { cn } from '@/renderer/src/lib/utils';

import { Skeleton } from '../../ui/skeleton';
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../../ui/command';

import { Loader2 } from 'lucide-react';

interface IProps {
	open: boolean;
	onOpenChange: (value: boolean) => void;
	tasks: Array<ITaskDefinition>;
	onFetchNextPage: () => void;
	hasNextPage: boolean;
	isLoading: boolean;
	isFetching: boolean;
	isFetchingNextPage: boolean;
	onSelectTask?: (taskDefinitionId: string) => void;
}

export function SearchCommand({
	open,
	onOpenChange,
	tasks,
	onFetchNextPage,
	hasNextPage,
	isLoading,
	isFetching,
	isFetchingNextPage,
	onSelectTask,
}: IProps) {
	const { ref: inViewRef, inView } = useInView();

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === '/') {
				e.preventDefault();
				onOpenChange(!open);
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, [onOpenChange, open]);

	useEffect(() => {
		if (inView) {
			onFetchNextPage();
		}
	}, [onFetchNextPage, inView]);

	return (
		<CommandDialog open={open} onOpenChange={onOpenChange}>
			<Command>
				<CommandInput placeholder="Search task..." disabled={isLoading || isFetching || isFetchingNextPage} />

				<CommandList
					className={cn([
						'no-scrollbar-buttons scrollbar-thin transition-all duration-100 scrollbar-thumb-transparent scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40',
					])}
				>
					<CommandEmpty>No results found.</CommandEmpty>

					{isLoading ? (
						<CommandGroup heading="Suggestions">
							{Array.from({ length: 5 }).map((_, index) => {
								return (
									<CommandItem key={index}>
										<Skeleton className="h-5 w-full" />
									</CommandItem>
								);
							})}
						</CommandGroup>
					) : (
						<CommandGroup heading="Suggestions">
							{tasks.map((task) => {
								return (
									<CommandItem key={task.id} value={task.id} keywords={[task.id, task.title]} onSelect={onSelectTask}>
										{task.title}
									</CommandItem>
								);
							})}
						</CommandGroup>
					)}

					{hasNextPage && (
						<CommandGroup>
							{isFetching || isFetchingNextPage ? (
								<CommandItem ref={inViewRef} className="text-xs text-muted-foreground">
									<Loader2 className="animate-spin" /> Loading tasks...
								</CommandItem>
							) : (
								<CommandItem ref={inViewRef} className="text-xs text-muted-foreground">
									Load more...
								</CommandItem>
							)}
						</CommandGroup>
					)}
				</CommandList>
			</Command>
		</CommandDialog>
	);
}
