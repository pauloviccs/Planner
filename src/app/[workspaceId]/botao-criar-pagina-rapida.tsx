"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Loader2 } from "lucide-react";
import { criarPaginaAcao } from "@/lib/acoes/pagina-acoes";
import { Botao } from "@/componentes/ui/botao";

interface PropriedadesBotaoCriarPagina {
  workspaceId: string;
  variante?: "card" | "botao";
}

export function BotaoCriarPaginaRapida({
  workspaceId,
  variante = "card",
}: PropriedadesBotaoCriarPagina) {
  const router = useRouter();
  const [carregando, setCarregando] = React.useState(false);

  const aoCriar = async () => {
    if (carregando) return;
    setCarregando(true);

    try {
      const res = await criarPaginaAcao(workspaceId, "Sem título");
      if (res.sucesso && res.pagina) {
        router.push(`/${workspaceId}/paginas/${res.pagina.id}`);
        router.refresh();
      }
    } finally {
      setCarregando(false);
    }
  };

  if (variante === "botao") {
    return (
      <Botao onClick={aoCriar} carregando={carregando}>
        <Plus className="h-4 w-4 mr-1" />
        <span>Criar Primeira Página</span>
      </Botao>
    );
  }

  return (
    <button
      onClick={aoCriar}
      disabled={carregando}
      className="superficie-glass group flex items-center gap-3.5 p-4 rounded-[var(--raio-lg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:scale-[1.01] text-left cursor-pointer disabled:opacity-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--raio-md)] bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
        {carregando ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <FileText className="h-5 w-5" />
        )}
      </div>
      <div>
        <h3 className="font-semibold text-sm text-[var(--foreground)]">
          Nova Página
        </h3>
        <p className="text-xs text-[var(--foreground-muted)]">
          Documentos, notas e wikis com editor em blocos
        </p>
      </div>
    </button>
  );
}
