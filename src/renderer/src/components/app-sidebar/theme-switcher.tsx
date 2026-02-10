import { useTheme } from '~/src/renderer/src/providers/theme-provider';
import { DropdownMenuItem } from '../ui/dropdown-menu';

import { Moon, SunMedium } from 'lucide-react';

export function ThemeSwitcher() {
	const { setTheme, theme } = useTheme();

	function toggleTheme() {
		if (theme === 'light') {
			setTheme('dark');
		}

		if (theme === 'dark') {
			setTheme('light');
		}
	}

	return (
		<DropdownMenuItem onClick={() => toggleTheme()}>
			{theme === 'light' ? <SunMedium /> : <Moon />}
			{theme === 'light' ? 'Light theme' : 'Dark theme'}
		</DropdownMenuItem>
	);
}
