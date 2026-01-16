import { type ReactNode } from 'react';
import { useAuth } from './context/auth-context';
import { Navigate } from 'react-router';

export function ProtectedRoute({ children }: { children: ReactNode }) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return <div className="p-6">Loading...</div>;
	}

	if (!user) return <Navigate to="/" replace />;

	return children;
}
