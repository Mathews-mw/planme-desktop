import z from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { ComponentProps, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router';

import { cn } from '../../lib/utils';
import { useAuth } from '../../context/auth-context';
import { isFirebaseError } from '../../lib/firebase/firebase-error';

import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { PasswordInput } from '../../components/ui/password-input';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../../components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

import { Loader2 } from 'lucide-react';

interface IProps extends ComponentProps<'div'> {
	onTabChange: () => void;
}

const formSchema = z.object({
	email: z.email({ error: 'Please, provide a valid e-mail' }),
	password: z.string({ error: 'Please, provide a password' }),
});

type FormData = z.infer<typeof formSchema>;

export function CredentialsSignInTab({ className, onTabChange, ...props }: IProps) {
	const { register, handleSubmit } = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	const { signIn } = useAuth();
	const router = useNavigate();
	const location = useLocation();

	const [isLoading, startTransition] = useTransition();

	const from = location.state?.from?.pathname ?? '/tasks';

	const handleSignIn = (data: FormData) => {
		startTransition(async () => {
			try {
				await signIn({ email: data.email, password: data.password });

				router(from, { replace: true });
			} catch (error) {
				console.log('sign in error: ', error);

				if (isFirebaseError(error)) {
					toast.error('Authentication error', { description: mapAuthError(error.code) });
				} else {
					toast.error('Unexpected error.');
				}
			}
		});
	};

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>Enter your email below to login to your account</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit(handleSignIn)}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input id="email" type="email" placeholder="me@example.com" {...register('email')} />
							</Field>

							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
										Forgot your password?
									</a>
								</div>
								<PasswordInput id="password" {...register('password')} />
							</Field>

							<Field>
								<Button type="submit">
									{isLoading && <Loader2 className="animate-spin" />}
									Login
								</Button>

								<Button variant="outline" type="button" disabled={isLoading} onClick={onTabChange}>
									Back
								</Button>

								<FieldDescription className="text-center">
									Don&apos;t have an account? <a href="#">Sign up</a>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

function mapAuthError(code: string) {
	switch (code) {
		case 'auth/invalid-email':
			return 'Invalid email.';
		case 'auth/user-not-found':
			return 'User not found.';
		case 'auth/invalid-credential':
			return 'Invalid credentials.';
		case 'auth/wrong-password':
			return 'Wrong password.';
		case 'auth/too-many-requests':
			return 'Too many attempts. Try again later.';
		default:
			return 'Authentication error.';
	}
}
