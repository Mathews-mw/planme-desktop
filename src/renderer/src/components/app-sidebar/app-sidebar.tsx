import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { CreateList } from './create-list';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from '../ui/sidebar';

import { IconInnerShadowTop } from '@tabler/icons-react';
import { NavTaskList } from './nav-task-list';

export function AppSidebar() {
	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
							<a href="#">
								<IconInnerShadowTop className="!size-5" />
								<span className="text-base font-semibold">Plan Me</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<NavMain />

				<SidebarSeparator className="mx-0" />

				<NavTaskList />

				<CreateList />
			</SidebarContent>

			<SidebarSeparator className="mx-0" />

			<SidebarFooter>
				<NavUser
					user={{
						name: 'Mathews Araujo',
						email: 'mathews.mw@gmail.com',
						avatar: '/avatar.png',
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
