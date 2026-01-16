import { ChevronRight } from 'lucide-react';
import { useMatches, Link, useLocation } from 'react-router';

type CrumbHandle = { crumb: string };

export function BreadcrumbsNavigation() {
	const matches = useMatches();
	const { pathname } = useLocation();

	const crumbs = matches
		.filter(
			(m): m is typeof m & { handle: CrumbHandle } => !!m.handle && typeof (m.handle as CrumbHandle).crumb === 'string'
		)
		.map((m) => ({
			crumb: (m.handle as CrumbHandle).crumb,
			to: m.pathname!,
		}));

	return (
		<nav aria-label="breadcrumb">
			<ol className="flex flex-wrap items-center gap-1 wrap-break-word sm:gap-2.5">
				{/* <li>
					<Link to="/">Task</Link>
				</li> */}

				{/* {pathname !== "/" && <ChevronRight className="size-4" />} */}

				{crumbs.map(({ crumb, to }, idx) => {
					const last = idx === crumbs.length - 1;

					return (
						<li key={to} className="inline-flex items-center gap-1.5">
							{last ? <span className="font-bold">{crumb}</span> : <Link to={to}>{crumb}</Link>}
							{!last && <ChevronRight className="size-4" />}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
