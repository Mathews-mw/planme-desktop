import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';

import { IconStar } from '@tabler/icons-react';

export function FavoriteTasksFilter() {
	const [searchParams, setSearchParams] = useSearchParams();

	const isStarredParams = searchParams.get('isStarred') ? true : false;

	const [isStarred, setIsStarred] = useState(isStarredParams);

	function handleIsStarredFilter(isStarred: boolean) {
		setIsStarred(isStarred);

		setSearchParams((params) => {
			if (isStarred) {
				params.set('isStarred', String(isStarred));
			} else {
				params.delete('isStarred');
			}

			return params;
		});
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="outline"
					className={cn(['hover:text-primary', isStarred ? 'text-primary' : 'text-muted-foreground'])}
					onClick={() => handleIsStarredFilter(!isStarred)}
				>
					<IconStar className={cn([isStarred ? 'fill-primary' : ''])} />
					Favorites
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>Filter by favorites tasks</p>
			</TooltipContent>
		</Tooltip>
	);
}
