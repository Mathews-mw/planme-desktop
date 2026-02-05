import { type ComponentType, type SVGProps } from 'react';
import { Link, useLocation, type LinkProps } from 'react-router';

import { SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import { cn } from '../../lib/utils';

interface INavItemProps extends LinkProps {
	title: string;
	icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export function NavItem({ title, icon: Icon, ...props }: INavItemProps) {
	const { pathname } = useLocation();

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={pathname === props.to}
				tooltip={title}
				className={cn([
					'pl-0 data-[active=true]:text-primary',
					"before:block before:h-4 before:w-0.75 before:rounded-full before:bg-transparent before:content-['']",
					'hover:before:bg-muted-foreground data-[active=true]:before:bg-primary',
				])}
			>
				<Link {...props}>
					{Icon && <Icon className="size-5" />}
					<span>{title}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}
