import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";

import { RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import { router } from "./routes";
import { queryClient } from "./lib/query-client";
import { ThemeProvider } from "~/src/providers/theme-provider";

import { Toaster } from "./components/ui/sonner";

dayjs.extend(utc);
dayjs.extend(relativeTime);

function App(): React.JSX.Element {
	return (
		<ThemeProvider defaultTheme="light" storageKey="planme-ui-theme">
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>

			<Toaster duration={8 * 1000} />
		</ThemeProvider>
	);
}

export default App;
