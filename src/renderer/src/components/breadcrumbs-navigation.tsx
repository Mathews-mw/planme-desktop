import { ChevronRight } from 'lucide-react';
import { useMatches, Link } from 'react-router';

import { type ITaskList } from '~/src/shared/types/task';

type CrumbHandle = { crumb: string } | { crumb: (data: ITaskList | undefined) => string };

export function BreadcrumbsNavigation() {
	const matches = useMatches();

	const crumbs = matches
		.filter((match): match is typeof match & { handle: CrumbHandle } => Boolean((match.handle as CrumbHandle)?.crumb))
		.map((match, index, arr) => {
			const isLast = index === arr.length - 1;

			const loaderData = match.loaderData as { data?: ITaskList } | undefined;

			const label =
				typeof match.handle.crumb === 'function' ? match.handle.crumb(loaderData?.data) : match.handle.crumb;

			return { crumb: label, to: match.pathname, isLast };
		});

	return (
		<nav aria-label="breadcrumb">
			<ol className="flex flex-wrap items-center gap-1 wrap-break-word sm:gap-2.5">
				{crumbs.map(({ crumb, to, isLast }) => {
					return (
						<li key={to} className="inline-flex items-center gap-1.5">
							{isLast ? <span className="font-bold">{crumb}</span> : <Link to={to}>{crumb}</Link>}
							{!isLast && <ChevronRight className="size-4" />}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
