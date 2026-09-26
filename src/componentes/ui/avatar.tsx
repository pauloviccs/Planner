import * as React from "react";
import { cn, obterIniciais } from "@/lib/utilitarios";

export interface PropriedadesAvatar extends React.HTMLAttributes<HTMLDivElement> {
  url?: string | null;
  nome?: string | null;
  tamanho?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({
  className,
  url,
  nome,
  tamanho = "md",
  ...props
}: PropriedadesAvatar) {
  const [imagemErro, setImagemErro] = React.useState(false);

  const tamanhosClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-xs",
    lg: "h-11 w-11 text-sm font-semibold",
    xl: "h-16 w-16 text-lg font-bold",
  };

  const iniciais = obterIniciais(nome);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-[var(--surface-elevada)] border border-[var(--border)] text-[var(--foreground)] select-none",
        tamanhosClasses[tamanho],
        className
      )}
      {...props}
    >
      {url && !imagemErro ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={nome || "Avatar do usuário"}
          className="h-full w-full object-cover"
          onError={() => setImagemErro(true)}
        />
      ) : (
        <span>{iniciais}</span>
      )}
    </div>
  );
}
