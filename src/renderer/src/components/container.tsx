import { ComponentProps } from 'react';
import { cn } from '../lib/utils';

export function Container({ children, className }: ComponentProps<'div'>) {
	return (
		<div className={cn('rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md', className)}>
			{children}
		</div>
	);
}
