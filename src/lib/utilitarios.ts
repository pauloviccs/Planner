import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes condicionais do Tailwind sem conflitos de especificidade.
 */
export function cn(...entradas: ClassValue[]): string {
  return twMerge(clsx(entradas));
}

/**
 * Gera um slug amigável para URLs a partir de um texto.
 * Ex: "Meu Primeiro Workspace" -> "meu-primeiro-workspace"
 */
export function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Formata data em formato brasileiro amigável.
 * Ex: 25 de set. de 2026
 */
export function formatarDataPtBr(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Formata data e hora em padrão pt-BR.
 */
export function formatarDataHoraPtBr(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Formata tempo relativo amigável (ex: "há 5 minutos", "ontem", "há 2 dias").
 */
export function formatarTempoRelativo(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  const agora = new Date();
  const diferencaSegundos = Math.floor((agora.getTime() - d.getTime()) / 1000);

  if (diferencaSegundos < 60) return "agora mesmo";
  const diferencaMinutos = Math.floor(diferencaSegundos / 60);
  if (diferencaMinutos < 60) return `há ${diferencaMinutos} min`;
  const diferencaHoras = Math.floor(diferencaMinutos / 60);
  if (diferencaHoras < 24) return `há ${diferencaHoras}h`;
  const diferencaDias = Math.floor(diferencaHoras / 24);
  if (diferencaDias === 1) return "ontem";
  if (diferencaDias < 30) return `há ${diferencaDias} dias`;
  return formatarDataPtBr(d);
}

export const formatarDistanciaTempo = formatarTempoRelativo;

/**
 * Obtém as iniciais de um nome (máximo 2 letras).
 */
export function obterIniciais(nome?: string | null): string {
  if (!nome) return "VP";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
