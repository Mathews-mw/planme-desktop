import { type ComponentType, type SVGProps } from 'react';
import { Link, useLocation, type LinkProps } from 'react-router';

import { SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';

interface INavItemProps extends LinkProps {
	title: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function NavItem({ title, icon: Icon, ...props }: INavItemProps) {
	const { pathname } = useLocation();

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild isActive={pathname === props.to} tooltip={title}>
				<Link {...props}>
					<Icon className="size-5" />
					<span>{title}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}
