import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export const badgeVariants = cva(
	'inline-flex w-fit shrink-0 items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-sm font-medium whitespace-nowrap',
	{
		variants: {
			priority: {
				NONE: 'border bg-transparent hover:bg-accent hover:text-accent-foreground  dark:border-input dark:hover:bg-background/50 focus-visible:border-input focus-visible:ring-input/50',
				LOW: 'bg-secondary text-foreground hover:bg-secondary/80 focus-visible:border-secondary focus-visible:ring-secondary/50',
				NORMAL:
					'bg-sky-500 dark:bg-sky-600 text-white hover:bg-sky-500/80 dark:hover:bg-sky-600/80 focus-visible:border-sky-500 focus-visible:ring-sky-500/50',
				HIGH: 'bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-500/80 dark:hover:bg-amber-600/80 focus-visible:border-amber-500 focus-visible:ring-amber-500/50',
			},
		},
		defaultVariants: {
			priority: 'NONE',
		},
	}
);

export function TaskPriorityBadge({
	className,
	priority = 'NONE',
	...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
	const label = priority ? priority[0] + priority.slice(1).toLowerCase() : '';

	return (
		<span data-variant={priority} className={cn(badgeVariants({ priority }), className)} {...props}>
			{label}
		</span>
	);
}
