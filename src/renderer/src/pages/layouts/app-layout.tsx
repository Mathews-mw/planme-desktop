import { Navigate, Outlet, useLocation } from 'react-router';

import { Header } from '../../components/header';
import { useAuth } from '../../context/auth-context';
import { AppSidebar } from '../../components/app-sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '../../components/ui/sidebar';
import { cn } from '../../lib/utils';

export function AppLayout() {
	const { status } = useAuth();
	const location = useLocation();

	if (status === 'unauthenticated') {
		return <Navigate to="/" replace state={{ from: location }} />;
	}

	return (
		<div className="flex h-screen">
			<SidebarProvider defaultOpen>
				<AppSidebar />

				<div className="m-2 ml-0 w-full overflow-clip rounded-xl">
					<SidebarInset className="flex h-full flex-1 flex-col bg-card">
						<Header />

						<main
							className={cn([
								'overflow-y-auto px-10 py-12',
								'no-scrollbar-buttons scrollbar-thin transition-all duration-100 scrollbar-thumb-transparent scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40',
							])}
						>
							<div className="min-w-0">
								<Outlet />
							</div>
						</main>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</div>
	);
}
