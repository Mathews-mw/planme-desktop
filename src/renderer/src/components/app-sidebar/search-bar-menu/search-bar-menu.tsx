import { useNavigate } from 'react-router';
import { useCallback, useMemo, useState } from 'react';
import { InfiniteData, QueryKey, useInfiniteQuery } from '@tanstack/react-query';

import type { ITaskCursorBasedResponse } from '~/src/shared/types/ipc';
import { errorHandler } from '../../../_api/error-handler/error-handler';
import { taskRepository } from '~/src/renderer/repositories/tasks-repository';

import { Kbd, KbdGroup } from '../../ui/kbd';
import { SearchCommand } from './search-command';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../ui/sidebar';

import { Search } from 'lucide-react';

export function SearchBarMenu() {
	const [open, setOpen] = useState(false);

	const router = useNavigate();

	const {
		data: tasksResponse,
		isLoading,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
	} = useInfiniteQuery<
		ITaskCursorBasedResponse,
		Error,
		InfiniteData<ITaskCursorBasedResponse>,
		QueryKey,
		string | undefined
	>({
		queryKey: ['tasks', 'cursor_based'],
		queryFn: async ({ pageParam }) => {
			const response = await taskRepository.listingTasksCursorBased({
				limit: 9999,
				cursor: pageParam,
			});

			if (!response.success) {
				errorHandler(response.error);
				return { hasMore: false, nextCursor: undefined, previousCursor: undefined, tasks: [] };
			}

			return response.data;
		},
		initialPageParam: undefined,
		getPreviousPageParam: (firstPage) => firstPage.previousCursor,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: open,
	});

	const tasksData = useMemo(() => {
		if (!tasksResponse) return [];

		const flatResponse = tasksResponse.pages.flatMap((item) => {
			return item.tasks;
		});

		return flatResponse;
	}, [tasksResponse]);

	const handleOpenChange = useCallback((isOpen: boolean) => {
		setOpen(isOpen);
	}, []);

	function handleSelectTask(taskDefinitionId: string) {
		setOpen(false);
		router(`occurrences/${taskDefinitionId}`);
	}

	return (
		<>
			<SidebarGroup>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<Tooltip>
								<TooltipTrigger asChild>
									<SidebarMenuButton onClick={() => handleOpenChange(true)}>
										<Search /> Search
									</SidebarMenuButton>
								</TooltipTrigger>

								<TooltipContent side="right">
									<div className="flex items-center gap-2">
										Find any task with quick search:{' '}
										<KbdGroup>
											<Kbd>Ctrl</Kbd>
											<span>+</span>
											<Kbd>/</Kbd>
										</KbdGroup>
									</div>
								</TooltipContent>
							</Tooltip>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			<SearchCommand
				tasks={tasksData}
				open={open}
				onOpenChange={handleOpenChange}
				onFetchNextPage={fetchNextPage}
				hasNextPage={hasNextPage}
				isLoading={isLoading}
				isFetching={isFetching}
				isFetchingNextPage={isFetchingNextPage}
				onSelectTask={handleSelectTask}
			/>
		</>
	);
}
