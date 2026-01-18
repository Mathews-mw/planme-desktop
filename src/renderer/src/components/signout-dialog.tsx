import { useTransition } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '../context/auth-context';

import { Button } from './ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';

import { Loader2 } from 'lucide-react';

interface IProps {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export function SignOutDialog({ open, setOpen }: IProps) {
	const { signOut } = useAuth();
	const router = useNavigate();

	const [isLoading, startTransition] = useTransition();

	const handleSignout = () => {
		startTransition(async () => {
			await signOut();
			router('/', { replace: true });
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you sure you want to end your session?</DialogTitle>
					<DialogDescription>You will need to log in again to access your account.</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={isLoading}>
							Cancel
						</Button>
					</DialogClose>
					<Button disabled={isLoading} onClick={() => handleSignout()}>
						{isLoading && <Loader2 className="animate-spin" />}
						Log out
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
