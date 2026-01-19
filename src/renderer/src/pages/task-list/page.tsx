import { useParams } from 'react-router';

export function TaskListPage() {
	const { slug } = useParams();

	console.log('task list slug: ', slug);

	return (
		<div>
			<h1>Task List</h1>
		</div>
	);
}
