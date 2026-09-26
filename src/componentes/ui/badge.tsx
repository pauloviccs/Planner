import * as React from "react";
import { cn } from "@/lib/utilitarios";

export interface PropriedadesBadge
  extends React.HTMLAttributes<HTMLDivElement> {
  variante?:
    | "padrao"
    | "secundario"
    | "sucesso"
    | "aviso"
    | "perigo"
    | "info"
    | "contorno";
  tamanho?: "sm" | "md";
}

export function Badge({
  className,
  variante = "padrao",
  tamanho = "sm",
  ...props
}: PropriedadesBadge) {
  const variantes = {
    padrao: "bg-[var(--accent)] text-white",
    secundario: "bg-[var(--surface-elevada)] text-[var(--foreground-muted)] border border-[var(--border)]",
    sucesso: "bg-[var(--sucesso-fundo)] text-[var(--sucesso)] border border-[var(--sucesso)]/20",
    aviso: "bg-[var(--aviso-fundo)] text-[var(--aviso)] border border-[var(--aviso)]/20",
    perigo: "bg-[var(--perigo-fundo)] text-[var(--perigo)] border border-[var(--perigo)]/20",
    info: "bg-[var(--info-fundo)] text-[var(--info)] border border-[var(--info)]/20",
    contorno: "border border-[var(--border)] text-[var(--foreground)]",
  };

  const tamanhos = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-[var(--raio-completo)] tracking-tight",
        variantes[variante],
        tamanhos[tamanho],
        className
      )}
      {...props}
    />
  );
}
