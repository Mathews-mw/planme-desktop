/**
 * Gera um slug padronizado a partir de uma string
 * @param text - Texto a ser convertido em slug
 * @returns Slug formatado com hífen como separador
 * @example
 * generateSlug("Título com acentuação") // "titulo-com-acentuacao"
 * generateSlug("Olá Mundo!") // "ola-mundo"
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase() // Converte para minúsculas
		.normalize('NFD') // Normaliza para forma decomposta
		.replace(/[\u0300-\u036f]/g, '') // Remove diacríticos (acentos)
		.trim() // Remove espaços das extremidades
		.replace(/\s+/g, '-') // Substitui espaços por hífen
		.replace(/[^\w-]/g, '') // Remove caracteres especiais (mantém apenas letras, números e hífen)
		.replace(/-+/g, '-') // Remove múltiplos hífens consecutivos
		.replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
}
