import { createBrowserRouter } from "react-router";

import { TasksPage } from "./pages/tasks/page";
import { AgendaPage } from "./pages/agenda/page";
import { AppLayout } from "./pages/layouts/app-layout";
import { FavoriteTasksPage } from "./pages/favorite-tasks/page";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <AppLayout />,
		children: [
			{
				index: true,
				element: <TasksPage />,
				handle: { crumb: "Tasks" },
			},
			{
				path: "favorites",
				element: <FavoriteTasksPage />,
				handle: { crumb: "Favorite Tasks" },
			},
			{
				path: "agenda",
				element: <AgendaPage />,
				handle: { crumb: "Agenda" },
			},
		],
	},
]);
