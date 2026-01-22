import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { generateSlug } from '~/src/utils/generate-slug';
import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';

import { NavItem } from './nav-item';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '../ui/sidebar';

interface IItemProps {
	title: string;
	url: string;
	icon?: string;
}

export function NavTaskList() {
	const { data: taskListResponse } = useQuery({
		queryKey: ['task-list'],
		queryFn: taskListRepository.listingAll,
		refetchOnWindowFocus: false,
	});

	console.log('nav taskListResponse: ', taskListResponse);

	const items = useMemo<Array<IItemProps>>(() => {
		if (!taskListResponse) {
			return [];
		}

		taskListResponse.data.shift(); // removes the first elemento from the array

		return taskListResponse.data.map((taskList) => {
			return {
				title: taskList.title,
				url: `/list/${generateSlug(taskList.title)}`,
				icon: taskList.icon || undefined,
			};
		});
	}, [taskListResponse]);

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => {
						return <NavItem key={item.title} to={item.url} title={item.title} />;
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
