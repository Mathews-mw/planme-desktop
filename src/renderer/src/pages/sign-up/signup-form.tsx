import z from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '../../lib/utils';
import { errorHandler } from '../../_api/error-handler/error-handler';
import { FirebaseAuthService } from '../../services/firebase-auth-service';
import { usersRepository } from '~/src/renderer/repositories/users-repository';

import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { PasswordInput } from '../../components/ui/password-input';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '../../components/ui/field';

import { Loader2 } from 'lucide-react';
import mobileLogin from '../../assets/mobile-login.png';
import { IconBrandAppleFilled, IconBrandGithubFilled, IconBrandGoogleFilled } from '@tabler/icons-react';

const formSchema = z.object({
	name: z.string({ error: 'Please, provide your name' }).min(1, { message: 'Please, provide your name' }),
	email: z.email({ error: 'Please, provide a valid e-mail' }),
	password: z
		.string({ error: 'Please, provide a password' })
		.min(6, { message: 'Password must be at least 6 characters long' }),
	confirmPassword: z
		.string({ error: 'Please, confirm your password' })
		.min(6, { message: 'Password must be at least 6 characters long' }),
});

type FormData = z.infer<typeof formSchema>;

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	const router = useNavigate();

	const { mutateAsync: createUserFn, isPending } = useMutation({
		mutationFn: async (data: FormData) => {
			const firebaseResult = await FirebaseAuthService.registerWithCredentials({
				email: data.email,
				password: data.password,
			});

			const result = await usersRepository.create({
				id: firebaseResult.uid,
				providerAccountId: firebaseResult.providerId,
				name: data.name,
				email: data.email,
				password: data.password,
			});

			return result;
		},
	});

	async function handleSignupForm(data: FormData) {
		if (data.password !== data.confirmPassword) {
			toast.warning('Passwords do not match');
			return;
		}

		try {
			const result = await createUserFn(data);

			if (!result.success) {
				errorHandler(result.error);
				return;
			}

			toast.success('Account created successfully!');
			reset();
			router(`/?email=${data.email}`, { replace: true });
		} catch (criticalError) {
			console.error('IPC Communication Crash:', criticalError);
			toast.error('Critical communication error with the system.');
		}
	}

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form onSubmit={handleSubmit(handleSignupForm)} className="p-6 md:p-8">
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">Create your account</h1>
								<p className="text-sm text-balance text-muted-foreground">
									Enter your email below to create your account
								</p>
							</div>

							<Field>
								<FieldLabel htmlFor="name">Name</FieldLabel>
								<Input id="name" placeholder="John Doe" {...register('name')} />
								<FieldError>{errors.name?.message}</FieldError>
							</Field>

							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
								<FieldError>{errors.email?.message}</FieldError>
							</Field>

							<Field>
								<Field className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="password">Password</FieldLabel>
										<PasswordInput id="password" {...register('password')} />
										<FieldError>{errors.password?.message}</FieldError>
									</Field>
									<Field>
										<FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
										<PasswordInput id="confirm-password" {...register('confirmPassword')} />
										<FieldError>{errors.confirmPassword?.message}</FieldError>
									</Field>
								</Field>
							</Field>

							<Field>
								<Button type="submit" disabled={isPending}>
									{isPending && <Loader2 className="animate-spin" />}
									Create Account
								</Button>
							</Field>

							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
								Or continue with
							</FieldSeparator>

							<Field className="grid grid-cols-3 gap-4">
								<Button variant="outline" type="button" disabled={isPending}>
									<IconBrandGoogleFilled className="size-5" />
									<span className="sr-only">Sign up with Google</span>
								</Button>
								<Button variant="outline" type="button" disabled={isPending}>
									<IconBrandGithubFilled className="size-5" />
									<span className="sr-only">Sign up with Github</span>
								</Button>
								<Button variant="outline" type="button" disabled={isPending}>
									<IconBrandAppleFilled className="size-5" />
									<span className="sr-only">Sign up with Apple</span>
								</Button>
							</Field>
							<FieldDescription className="text-center">
								Already have an account?{' '}
								<Button
									variant="link"
									disabled={isPending}
									onClick={() => router('/')}
									className="m-0 p-0 text-muted-foreground underline hover:text-primary"
								>
									Sign Up
								</Button>
							</FieldDescription>
						</FieldGroup>
					</form>
					<div className="relative hidden bg-muted md:block">
						<img src={mobileLogin} alt="Image" className="absolute inset-0 h-full w-full object-cover" />
					</div>
				</CardContent>
			</Card>

			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
			</FieldDescription>
		</div>
	);
}
