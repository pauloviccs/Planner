import * as React from "react";
import { cn } from "@/lib/utilitarios";

export interface PropriedadesInput
  extends React.InputHTMLAttributes<HTMLInputElement> {
  erro?: string;
  iconeEsquerda?: React.ReactNode;
  iconeDireita?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, PropriedadesInput>(
  ({ className, type = "text", erro, iconeEsquerda, iconeDireita, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {iconeEsquerda && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none">
            {iconeEsquerda}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-9.5 w-full rounded-[var(--raio-md)] bg-[var(--surface-elevada)] px-3 py-1.5 text-sm text-[var(--foreground)]",
            "border border-[var(--border)] transition-colors placeholder:text-[var(--foreground-sutil)]",
            "focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            iconeEsquerda && "pl-9",
            iconeDireita && "pr-9",
            erro && "border-[var(--perigo)] focus-visible:ring-[var(--perigo-fundo)]",
            className
          )}
          {...props}
        />
        {iconeDireita && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
            {iconeDireita}
          </div>
        )}
        {erro && (
          <span className="text-xs text-[var(--perigo)] mt-1 block">
            {erro}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
