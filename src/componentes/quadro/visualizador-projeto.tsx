"use client";

import * as React from "react";
import { LayoutGrid, Table, Calendar, Clock } from "lucide-react";
import type { QuadroDetalhe } from "@/lib/acoes/projeto-acoes";
import { QuadroKanban } from "./quadro-kanban";
import { TabelaKanban } from "./tabela-kanban";
import { CalendarioKanban } from "./calendario-kanban";
import { TimelineKanban } from "@/componentes/projetos/timeline-kanban";
import { useRouter } from "next/navigation";

interface PropriedadesVisualizadorProjeto {
  quadro: QuadroDetalhe;
  workspaceId: string;
}

type TipoVisualizacao = "kanban" | "tabela" | "calendario" | "timeline";

export function VisualizadorProjeto({
  quadro,
  workspaceId,
}: PropriedadesVisualizadorProjeto) {
  const router = useRouter();
  const [visao, setVisao] = React.useState<TipoVisualizacao>("kanban");

  const aoAtualizar = () => {
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Seletor de Visualizações (Abas) */}
      <div className="flex items-center gap-1 p-1 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)] w-fit">
        <button
          onClick={() => setVisao("kanban")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            visao === "kanban"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Kanban</span>
        </button>

        <button
          onClick={() => setVisao("tabela")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            visao === "tabela"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Table className="h-3.5 w-3.5" />
          <span>Tabela</span>
        </button>

        <button
          onClick={() => setVisao("calendario")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            visao === "calendario"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Calendário</span>
        </button>

        <button
          onClick={() => setVisao("timeline")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            visao === "timeline"
              ? "bg-[var(--accent)] text-white shadow-xs"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Linha do Tempo</span>
        </button>
      </div>

      {/* Renderização da Visualização Ativa */}
      {visao === "kanban" && (
        <QuadroKanban quadro={quadro} workspaceId={workspaceId} />
      )}

      {visao === "tabela" && (
        <TabelaKanban quadro={quadro} aoAtualizar={aoAtualizar} />
      )}

      {visao === "calendario" && (
        <CalendarioKanban quadro={quadro} aoAtualizar={aoAtualizar} />
      )}

      {visao === "timeline" && (
        <TimelineKanban quadro={quadro} aoAtualizar={aoAtualizar} />
      )}
    </div>
  );
}

