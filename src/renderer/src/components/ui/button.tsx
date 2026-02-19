import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from 'src/renderer/src/lib/utils';

export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer active:scale-[1.01] active:opacity-80",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive:
					'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline:
					'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
				icon: 'size-9',
				'icon-sm': 'size-8',
				'icon-lg': 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

type ButtonProps = React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		ripple?: boolean;
		rippleOpacity?: number;
	};

export function Button({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	ripple = true,
	rippleOpacity = 0.5,
	onPointerDown,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : 'button';

	const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
		// chama handler do usuário primeiro (ou depois, tanto faz)
		onPointerDown?.(e);

		if (!ripple) return;
		if (variant === 'link') return; // normalmente link não tem ripple
		if (props.disabled) return;
		if (e.button !== 0) return; // somente clique principal (mouse)

		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();

		const sizePx = Math.max(rect.width, rect.height);
		const x = e.clientX - rect.left - sizePx / 2;
		const y = e.clientY - rect.top - sizePx / 2;

		const span = document.createElement('span');

		span.className = 'btn-ripple';
		span.style.width = span.style.height = `${sizePx}px`;
		span.style.left = `${x}px`;
		span.style.top = `${y}px`;
		span.style.opacity = String(rippleOpacity);

		el.appendChild(span);

		span.addEventListener('animationend', () => {
			span.remove();
		});
	};

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			onPointerDown={handlePointerDown}
			className={cn(
				buttonVariants({ variant, size, className }),
				// necessário pro ripple: posição/recorte (mas evita no link)
				variant !== 'link' && 'relative isolate overflow-hidden'
			)}
			{...props}
		/>
	);
}
