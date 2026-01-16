import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';

import { Button } from '../../components/ui/button';
import { CredentialsSignInTab } from './credentials-signin-tab';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

import logoImage from '../../assets/logo.png';
import brandImage from '../../assets/branding.png';
import planningImage from '../../assets/planning.jpg';
import { IconBrandGithubFilled, IconBrandGoogleFilled } from '@tabler/icons-react';

export function WelcomePage() {
	const [searchParams] = useSearchParams();

	const emailQueryParams = searchParams.get('email') ?? undefined;

	const [currentTab, setCurrentTab] = useState<'login-methods' | 'credentials'>('login-methods');

	console.log('Email Params:', emailQueryParams);

	const router = useNavigate();

	return (
		<>
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="relative hidden h-screen w-1/2 border-r bg-background lg:block">
					<div className="flex h-full w-full items-center justify-center overflow-hidden">
						<img src={planningImage} alt="Placeholder Image" className="h-full w-full object-cover" />
					</div>

					<div className="absolute top-0 left-0">
						<img src={brandImage} className="h-20" />
					</div>

					<div className="absolute bottom-4 left-4 flex flex-col">
						<span className="text-text text-muted-foreground">© PlanMe - {new Date().getFullYear()}</span>
						<span className="text-text text-muted-foreground">v. 1.0.0</span>
					</div>
				</div>

				<AnimatePresence mode="wait">
					<motion.div
						key={currentTab}
						initial={{ x: currentTab !== 'login-methods' ? 100 : -100, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: currentTab !== 'login-methods' ? 100 : 0, opacity: 0 }}
						transition={{ duration: 0.2, type: 'tween' }}
						className="sm:20 flex w-full items-center justify-center p-8 md:p-52 lg:w-1/2 lg:p-36"
					>
						{currentTab === 'login-methods' && (
							<Card className="w-105">
								<CardHeader>
									<img src={logoImage} alt="Marca Bemol" className="mx-auto mb-4 h-16" />

									<CardTitle className="text-center text-lg font-bold">Welcome to Plan Me</CardTitle>
								</CardHeader>

								<CardContent>
									<p className="mb-4 text-center text-sm text-foreground">
										Access your account using your credentials.
									</p>

									<Button
										variant="outline"
										onClick={() => setCurrentTab('credentials')}
										className="flex w-full items-center justify-center gap-2 p-4"
									>
										Sign in
									</Button>

									<hr className="mt-4 mb-4" />

									<div>
										<p className="mb-4 text-center text-sm text-foreground">Or use one of the social providers.</p>

										<div className="grid grid-cols-2 gap-4">
											<Button variant="outline">
												<IconBrandGoogleFilled />
												Google
											</Button>
											<Button variant="outline">
												<IconBrandGithubFilled />
												Github
											</Button>
										</div>
									</div>
								</CardContent>

								<CardFooter>
									<div className="flex w-full items-center justify-center">
										<span className="text-center">
											Don't have an account?{' '}
											<Button variant="link" onClick={() => router('/signup')} className="m-0 p-0">
												Sign Up
											</Button>
										</span>
									</div>
								</CardFooter>
							</Card>
						)}

						{currentTab === 'credentials' && (
							<div className="w-full max-w-sm">
								<CredentialsSignInTab onTabChange={() => setCurrentTab('login-methods')} />
							</div>
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</>
	);
}
