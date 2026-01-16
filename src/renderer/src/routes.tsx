import { createBrowserRouter } from 'react-router';

import { TasksPage } from './pages/tasks/page';
import { AgendaPage } from './pages/agenda/page';
import { AppLayout } from './pages/layouts/app-layout';
import { FavoriteTasksPage } from './pages/favorite-tasks/page';
import { WelcomePage } from './pages/welcome/page';
import { SignUpPage } from './pages/sign-up/page';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <WelcomePage />,
	},
	{
		path: '/signup',
		element: <SignUpPage />,
	},
	{
		path: '/',
		element: <AppLayout />,
		children: [
			{
				path: 'tasks',
				element: <TasksPage />,
				handle: { crumb: 'Tasks' },
			},
			{
				path: 'favorites',
				element: <FavoriteTasksPage />,
				handle: { crumb: 'Favorite Tasks' },
			},
			{
				path: 'agenda',
				element: <AgendaPage />,
				handle: { crumb: 'Agenda' },
			},
		],
	},
	// {
	// 	path: '/',
	// 	element: <AuthLayout />,
	// 	children: [{ path: '/login', element: <LoginPage />, handle: { crumb: 'Login' } }],
	// },
]);
