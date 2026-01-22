import { ComponentProps } from 'react';
import { cn } from '../lib/utils';

export function Container({ children, className }: ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'shadow-msm rounded-lg border border-foreground/10 bg-foreground/5 p-4 backdrop-blur-sm',
				className
			)}
		>
			{children}
		</div>
	);
}
