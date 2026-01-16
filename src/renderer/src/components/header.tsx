import { Separator } from './ui/separator';
import { SearchForm } from './search-form';
import { SidebarTrigger } from './ui/sidebar';
import { BreadcrumbsNavigation } from './breadcrumbs-navigation';
import { CreateTaskSheet } from './create-task-sheet/create-task-sheet';

export function Header() {
	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b py-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />

				<Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

				<BreadcrumbsNavigation />

				<div className="mx-auto">
					<SearchForm />
				</div>

				<CreateTaskSheet />
			</div>
		</header>
	);
}
