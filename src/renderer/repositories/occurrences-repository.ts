import { IOccurrencesQuery } from '~/src/shared/types/ipc';

export const occurrencesRepository = {
	listingOccurrences: (query: IOccurrencesQuery) => window.api.listingOccurrences(query),
};
