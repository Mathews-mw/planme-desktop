import { useEffect, useState } from 'react';

/**
 * `useDebounce` “filtra” mudanças rápidas em um valor (`value`) e só propaga a atualização quando o valor final se mantiver estável por um intervalo de tempo definido (`delay`).
 *
 * @ param value => alue de tipo genérico T;
 * @ param delay (em milissegundos), por padrão é 500;
 */
export function useDebounce<T>(value: T, delay = 500) {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => clearTimeout(timeout);
	}, [value, delay]);

	return debouncedValue;
}
