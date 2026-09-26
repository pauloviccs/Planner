import * as React from "react";
import Link from "next/link";
import { FolderKanban, ArrowRight, LayoutGrid, Clock } from "lucide-react";
import { obterProjetosDoWorkspace } from "@/lib/acoes/projeto-acoes";
import { formatarTempoRelativo } from "@/lib/utilitarios";
import { ModalCriarProjeto } from "../modal-criar-projeto";

interface PropriedadesProjetosWorkspace {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function PaginaListaProjetos({
  params,
}: PropriedadesProjetosWorkspace) {
  const { workspaceId } = await params;
  const projetos = await obterProjetosDoWorkspace(workspaceId);
  const baseHref = `/${workspaceId}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Projetos & Quadros Kanban
          </h1>
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            Organize suas tarefas, sprints e fluxos de trabalho com visão visual estilo Trello.
          </p>
        </div>
        <ModalCriarProjeto workspaceId={workspaceId} textoBotao="Novo Projeto" />
      </div>

      {projetos.length === 0 ? (
        <div className="superficie-glass p-12 rounded-[var(--raio-lg)] text-center border border-[var(--border)]">
          <FolderKanban className="h-10 w-10 mx-auto text-[var(--foreground-sutil)] mb-3" />
          <h3 className="text-base font-semibold text-[var(--foreground)]">
            Nenhum projeto cadastrado
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto mt-1 mb-6">
            Crie seu primeiro projeto para acompanhar tarefas em colunas como "A Fazer", "Em Andamento" e "Concluído".
          </p>
          <ModalCriarProjeto workspaceId={workspaceId} textoBotao="Criar Primeiro Projeto" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projetos.map((proj) => (
            <Link
              key={proj.id}
              href={`${baseHref}/projetos/${proj.id}`}
              className="superficie-glass p-5 rounded-[var(--raio-lg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:scale-[1.01] flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[var(--raio-md)] text-white shadow-sm"
                    style={{ backgroundColor: proj.cor }}
                  >
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] text-[var(--foreground-sutil)] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatarTempoRelativo(proj.criado_em)}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  {proj.nome}
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2">
                  {proj.descricao || "Sem descrição informada."}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--accent)] font-medium">
                <span className="flex items-center gap-1">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Visualizar Kanban
                </span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
