import { ITaskList } from '~/src/shared/types/task';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useEffect, useState } from 'react';

interface IProps {
	taskList: ITaskList[];
	disabled?: boolean;
	onSelectList: (listSlug: string) => Promise<void>;
	defaultValue?: string;
}

export function MoveToListSelect({ taskList, disabled = false, onSelectList, defaultValue }: IProps) {
	const [selectedList, setSelectedList] = useState(defaultValue);

	async function handleSelectList(listSlug: string) {
		if (!listSlug) return;

		setSelectedList(listSlug);

		try {
			await onSelectList(listSlug);
		} catch {
			// não precisa fazer nada aqui se já faz rollback no cache
		}
	}

	useEffect(() => {
		setSelectedList(defaultValue);
	}, [defaultValue]);

	return (
		<div className="space-y-2">
			<Label htmlFor="list">Move to</Label>

			<Select disabled={disabled} value={selectedList ?? 'task'} onValueChange={handleSelectList}>
				<SelectTrigger id="list" className="w-full">
					<SelectValue placeholder="Add to list..." />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{taskList.map((list) => {
							return (
								<SelectItem key={list.slug} value={list.slug}>
									{list.title}
								</SelectItem>
							);
						})}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
}
