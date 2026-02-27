import { type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from './context/auth-context';

export function ProtectedRoute({ children }: { children: ReactNode }) {
	const { user, status } = useAuth();

	if (!user && status === 'unauthenticated') return <Navigate to="/" replace />;

	return children;
}
