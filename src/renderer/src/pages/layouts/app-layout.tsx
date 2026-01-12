import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar/app-sidebar";
import { Header } from "../../components/header";

export function AppLayout() {
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
