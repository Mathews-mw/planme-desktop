import { Kbd, KbdGroup } from './ui/kbd';
import { Separator } from './ui/separator';
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { BreadcrumbsNavigation } from './breadcrumbs-navigation';
import { CreateTaskSheet } from './create-task-sheet/create-task-sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function Header() {
	const { open } = useSidebar();

	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b py-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
				<div className="flex items-center">
					<Tooltip>
						<TooltipTrigger asChild>
							<SidebarTrigger className="-ml-1" />
						</TooltipTrigger>

						<TooltipContent side="right">
							<div className="flex items-center gap-2">
								{open ? 'Collapse Sidebar' : 'Expand Sidebar'}:{' '}
								<KbdGroup>
									<Kbd>Ctrl</Kbd>
									<span>+</span>
									<Kbd>B</Kbd>
								</KbdGroup>
							</div>
						</TooltipContent>
					</Tooltip>

					<Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

					<BreadcrumbsNavigation />
				</div>

				<CreateTaskSheet />
			</div>
		</header>
	);
}
