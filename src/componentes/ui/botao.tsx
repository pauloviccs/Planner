import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utilitarios";

export interface PropriedadesBotao
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?:
    | "padrao"
    | "secundario"
    | "contorno"
    | "fantasma"
    | "perigo"
    | "sucesso"
    | "link";
  tamanho?: "sm" | "md" | "lg" | "icone";
  carregando?: boolean;
}

export const Botao = React.forwardRef<HTMLButtonElement, PropriedadesBotao>(
  (
    {
      className,
      variante = "padrao",
      tamanho = "md",
      carregando = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantesClasses = {
      padrao:
        "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm active:scale-[0.98]",
      secundario:
        "bg-[var(--surface-elevada)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface)] hover:border-[var(--border-hover)]",
      contorno:
        "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-elevada)] hover:border-[var(--border-hover)]",
      fantasma:
        "bg-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]",
      perigo:
        "bg-[var(--perigo)] text-white hover:opacity-90 shadow-sm active:scale-[0.98]",
      sucesso:
        "bg-[var(--sucesso)] text-white hover:opacity-90 shadow-sm active:scale-[0.98]",
      link: "text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto bg-transparent",
    };

    const tamanhosClasses = {
      sm: "h-8 px-3 text-xs rounded-[var(--raio-sm)] gap-1.5",
      md: "h-9 px-4 text-sm rounded-[var(--raio-md)] gap-2",
      lg: "h-11 px-6 text-base rounded-[var(--raio-md)] gap-2.5",
      icone: "h-9 w-9 p-0 rounded-[var(--raio-md)] justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || carregando}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variantesClasses[variante],
          tamanhosClasses[tamanho],
          className
        )}
        {...props}
      >
        {carregando && (
          <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current" />
        )}
        {children}
      </button>
    );
  }
);

Botao.displayName = "Botao";
