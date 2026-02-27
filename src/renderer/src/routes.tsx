import { createBrowserRouter } from 'react-router';

import { queryClient } from './lib/query-client';
import { type ITaskList } from '~/src/shared/types/task';
import { getTaskListBySlugQuery } from './_api/queries/get-task-list-by-slug-queries';

import { TasksPage } from './pages/tasks/page';
import { AgendaPage } from './pages/agenda/page';
import { SignUpPage } from './pages/sign-up/page';
import { WelcomePage } from './pages/welcome/page';
import { AppLayout } from './pages/layouts/app-layout';
import { AuthLayout } from './pages/layouts/auth-layout';
import { FavoriteTasksPage } from './pages/favorite-tasks/page';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <AuthLayout />,
		children: [
			{ index: true, element: <WelcomePage /> },
			{
				path: 'signup',
				element: <SignUpPage />,
				handle: { crumb: 'Sign Up' },
			},
		],
	},
	{
		path: '/',
		element: <AppLayout />,
		children: [
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
			{
				path: 'tasks/:slug',
				element: <TasksPage />,
				loader: async ({ params }) => {
					const slug = params.slug!;

					const data = await queryClient.ensureQueryData(getTaskListBySlugQuery(slug));

					return { data };
				},
				handle: {
					crumb: (data: ITaskList | undefined) => {
						const crumbLabel = data ? data.title : 'Loading...';
						return crumbLabel;
					},
				},
			},
		],
	},
]);
