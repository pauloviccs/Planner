"use client";

import * as React from "react";
import { usarTema } from "@/componentes/provedores/provedor-tema";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utilitarios";

const opcoesTema = [
  { valor: "escuro" as const, icone: Moon, rotulo: "Escuro" },
  { valor: "claro" as const, icone: Sun, rotulo: "Claro" },
  { valor: "sistema" as const, icone: Monitor, rotulo: "Sistema" },
];

export function AlternadorTema() {
  const { tema, alternarTema } = usarTema();
  const [montado, setMontado] = React.useState(false);

  React.useEffect(() => {
    setMontado(true);
  }, []);

  return (
    <div
      className="flex items-center gap-1 rounded-full p-1 bg-[var(--surface)] border border-[var(--border)]"
      role="radiogroup"
      aria-label="Selecionar tema"
      suppressHydrationWarning
    >
      {opcoesTema.map(({ valor, icone: Icone, rotulo }) => {
        // Antes do mount no cliente, usamos o tema padrão escuro para bater com o SSR
        const ativo = montado ? tema === valor : valor === "escuro";
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={rotulo}
            title={rotulo}
            onClick={() => alternarTema(valor)}
            className={cn(
              "transicao-cores relative flex h-7 w-7 items-center justify-center rounded-full cursor-pointer",
              ativo
                ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-xs"
                : "bg-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            )}
            suppressHydrationWarning
          >
            <Icone size={14} strokeWidth={2} suppressHydrationWarning />
          </button>
        );
      })}
    </div>
  );
}
