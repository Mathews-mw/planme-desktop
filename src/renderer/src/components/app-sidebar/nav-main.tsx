import type { ComponentType, SVGProps } from 'react';

import { NavItem } from './nav-item';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '../ui/sidebar';

import { IconNotebook, IconSquareRoundedCheck, IconStar } from '@tabler/icons-react';

interface IItemProps {
	title: string;
	url: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	children?: Array<{
		title: string;
		url: string;
	}>;
}

export function NavMain() {
	const items: Array<IItemProps> = [
		{
			title: 'Tasks',
			url: '/tasks/tasks',
			icon: IconSquareRoundedCheck,
		},
		{
			title: 'Agenda',
			url: '/agenda',
			icon: IconNotebook,
		},
	];

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => {
						return <NavItem key={item.title} to={item.url} title={item.title} icon={item.icon} />;
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
