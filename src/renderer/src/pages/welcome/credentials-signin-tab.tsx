import z from 'zod';
import { toast } from 'sonner';
import { ComponentProps } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '../../lib/utils';
import { isFirebaseError } from '../../lib/firebase/firebase-error';
import { signInWithCredentials } from '../../services/auth-service';

import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { PasswordInput } from '../../components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../../components/ui/field';

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
	const { register, handleSubmit, reset } = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	const router = useNavigate();

	const { mutateAsync: signInFn, isPending } = useMutation({
		mutationFn: signInWithCredentials,
	});

	async function handleSignIn(data: FormData) {
		try {
			await signInFn({ email: data.email, password: data.password });

			router('/tasks', { replace: true });
		} catch (error) {
			console.log('sign in error: ', error);

			if (isFirebaseError(error)) {
				toast.error('Authentication error', { description: mapAuthError(error.code) });
			} else {
				toast.error('Unexpected error.');
			}
		}
	}

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
									{isPending && <Loader2 className="animate-spin" />}
									Login
								</Button>

								<Button variant="outline" type="button" disabled={isPending} onClick={onTabChange}>
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
