import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
	'inline-flex w-fit shrink-0 items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-sm font-medium whitespace-nowrap',
	{
		variants: {
			priority: {
				NONE: 'border-border text-foreground',
				LOW: 'bg-secondary text-foreground',
				NORMAL: 'bg-sky-500 dark:bg-sky-600 text-white',
				HIGH: 'bg-amber-500 dark:bg-amber-600 text-white',
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
