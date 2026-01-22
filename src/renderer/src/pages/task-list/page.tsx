import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { getTaskListBySlugQuery } from '../../_api/queries/get-task-list-by-slug-queries';

export function TaskListPage() {
	const { slug } = useParams();

	const { data: taskList } = useQuery(getTaskListBySlugQuery(slug!));

	return (
		<div>
			<h1>Task List</h1>
		</div>
	);
}
