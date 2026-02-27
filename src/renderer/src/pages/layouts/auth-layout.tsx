import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../../context/auth-context';

export function AuthLayout() {
	const { status } = useAuth();
	const location = useLocation();

	if (status === 'authenticated') {
		return <Navigate to="/tasks/tasks" replace state={{ from: location }} />;
	}

	return (
		<div>
			<Outlet />
		</div>
	);
}
