import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '../../lib/query-client';
import { generateSlug } from '~/src/utils/generate-slug';
import { type ITaskList } from '~/src/shared/types/task';
import { taskListRepository } from '~/src/renderer/repositories/task-list-repository';

import { NavItem } from './nav-item';
import { EditListDialog } from './edit-list-dialog';
import { DeleteListDialog } from './delete-list-dialog';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '../ui/sidebar';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '../ui/context-menu';

import { Copy, Loader2, PencilIcon, TrashIcon } from 'lucide-react';

interface IItemProps extends ITaskList {
	url: string;
}

export function NavTaskList() {
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [selectedTaskList, setSelectedTaskList] = useState<ITaskList | undefined>(undefined);

	const { data: taskListResponse } = useQuery({
		queryKey: ['task-list'],
		queryFn: taskListRepository.listingAll,
	});

	const items = useMemo<Array<IItemProps>>(() => {
		if (!taskListResponse) {
			return [];
		}

		taskListResponse.data.shift(); // removes the first elemento from the array

		return taskListResponse.data.map((taskList) => {
			return {
				...taskList,
				url: `/list/${generateSlug(taskList.title)}`,
			};
		});
	}, [taskListResponse]);

	const { mutateAsync: copyListFn, isPending: isPendingCopyList } = useMutation({
		mutationFn: taskListRepository.copy,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['task-list'] });
		},
	});

	function handleToggleOpenEditDialog(open: boolean, taskList?: ITaskList) {
		if (open && taskList) {
			setSelectedTaskList(taskList);
			setOpenEditDialog(true);
		} else {
			setOpenEditDialog(false);
			setSelectedTaskList(undefined);
		}
	}

	function handleToggleOpenDeleteDialog(open: boolean, taskList?: ITaskList) {
		if (open && taskList) {
			setSelectedTaskList(taskList);
			setOpenDeleteDialog(true);
		} else {
			setOpenDeleteDialog(false);
			setSelectedTaskList(undefined);
		}
	}

	return (
		<>
			<SidebarGroup>
				<SidebarGroupContent>
					<SidebarMenu>
						{items.map((item) => {
							return (
								<ContextMenu key={item.id}>
									<ContextMenuTrigger>
										<NavItem to={item.url} title={item.title} />
									</ContextMenuTrigger>

									<ContextMenuContent>
										<ContextMenuGroup>
											<ContextMenuItem onSelect={() => handleToggleOpenEditDialog(true, item)}>
												<PencilIcon />
												Rename
											</ContextMenuItem>
											<ContextMenuItem disabled={isPendingCopyList} onClick={() => copyListFn({ id: item.id })}>
												{isPendingCopyList ? <Loader2 className="animate-spin" /> : <Copy />}
												Copy list
											</ContextMenuItem>
										</ContextMenuGroup>
										<ContextMenuSeparator />
										<ContextMenuGroup>
											<ContextMenuItem variant="destructive" onSelect={() => handleToggleOpenDeleteDialog(true, item)}>
												<TrashIcon />
												Delete
											</ContextMenuItem>
										</ContextMenuGroup>
									</ContextMenuContent>
								</ContextMenu>
							);
						})}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			<EditListDialog
				taskList={selectedTaskList}
				open={openEditDialog}
				onOpen={(open) => handleToggleOpenEditDialog(open)}
			/>

			<DeleteListDialog
				taskList={selectedTaskList}
				open={openDeleteDialog}
				onOpen={(open) => handleToggleOpenDeleteDialog(open)}
			/>
		</>
	);
}
