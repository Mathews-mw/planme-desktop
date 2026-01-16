import { Search } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group';

export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
	return (
		<form {...props}>
			<InputGroup>
				<InputGroupInput placeholder="Search..." />
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
				<InputGroupAddon align="inline-end">12 results</InputGroupAddon>
			</InputGroup>
		</form>
	);
}
