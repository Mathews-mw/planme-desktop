import { Navigate, Outlet, useLocation } from 'react-router';

import { Header } from '../../components/header';
import { useAuth } from '../../context/auth-context';
import { AppSidebar } from '../../components/app-sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '../../components/ui/sidebar';

export function AppLayout() {
	const { status } = useAuth();
	const location = useLocation();

	if (status === 'unauthenticated') {
		return <Navigate to="/" replace state={{ from: location }} />;
	}

	return (
		<SidebarProvider defaultOpen>
			<AppSidebar />

			<SidebarInset className="bg-card">
				<Header />

				<main className="flex flex-1 gap-8 px-10 py-12">
					<div className="min-w-0 flex-1">
						<Outlet />
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
