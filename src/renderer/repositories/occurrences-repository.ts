import { IOccurrencesByTaskQuery, IOccurrencesCursorBasedQuery, IOccurrencesQuery } from '~/src/shared/types/ipc';

export const occurrencesRepository = {
	listingOccurrences: (query: IOccurrencesQuery) => window.api.listingOccurrences(query),
	listingOccurrencesCursorBased: (query: IOccurrencesCursorBasedQuery) =>
		window.api.listingOccurrencesCursorBased(query),
	getOccurrencesByTask: (query: IOccurrencesByTaskQuery) => window.api.getOccurrencesByTask(query),
};
