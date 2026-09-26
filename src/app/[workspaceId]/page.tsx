import * as React from "react";
import Link from "next/link";
import {
  FileText,
  FolderKanban,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { obterPaginasDoWorkspace } from "@/lib/acoes/pagina-acoes";
import { obterProjetosDoWorkspace } from "@/lib/acoes/projeto-acoes";
import { formatarTempoRelativo } from "@/lib/utilitarios";
import { BotaoCriarPaginaRapida } from "./botao-criar-pagina-rapida";
import { ModalCriarProjeto } from "./modal-criar-projeto";

interface PropriedadesDashboard {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function PaginaDashboardWorkspace({
  params,
}: PropriedadesDashboard) {
  const { workspaceId } = await params;

  // Busca páginas e projetos do workspace
  const [paginas, projetos] = await Promise.all([
    obterPaginasDoWorkspace(workspaceId),
    obterProjetosDoWorkspace(workspaceId),
  ]);

  const baseHref = `/${workspaceId}`;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Cabeçalho de Boas-Vindas */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 items-center gap-1 px-2.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Visão Geral
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Bem-vindo ao seu Workspace
        </h1>
        <p className="text-sm text-[var(--foreground-muted)] max-w-xl">
          Centralize seus documentos, notas, quadros Kanban e projetos em um único ambiente colaborativo.
        </p>
      </section>

      {/* Ações Rápidas */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-sutil)] px-1">
          Ações Rápidas
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <BotaoCriarPaginaRapida workspaceId={workspaceId} />
          <ModalCriarProjeto workspaceId={workspaceId} />
        </div>
      </section>

      {/* Seção de Documentos & Páginas Recentes */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-sutil)] px-1">
            Documentos Recentes ({paginas.length})
          </h2>
          <Link
            href={`${baseHref}/paginas`}
            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-medium"
          >
            <span>Ver todas as páginas</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {paginas.length === 0 ? (
          <div className="superficie-glass p-8 rounded-[var(--raio-lg)] text-center border border-[var(--border)]">
            <FileText className="h-8 w-8 mx-auto text-[var(--foreground-sutil)] mb-2" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Nenhuma página criada ainda
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] max-w-xs mx-auto mt-1 mb-4">
              Crie notas de reuniões, wikis da equipe ou especificações técnicas.
            </p>
            <BotaoCriarPaginaRapida workspaceId={workspaceId} variante="botao" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginas.slice(0, 6).map((pagina) => (
              <Link
                key={pagina.id}
                href={`${baseHref}/paginas/${pagina.id}`}
                className="superficie-glass p-4 rounded-[var(--raio-md)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:scale-[1.01] flex flex-col justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--raio-sm)] bg-[var(--surface-elevada)] text-[var(--foreground)] border border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                      {pagina.titulo || "Sem título"}
                    </h4>
                    <span className="text-[11px] text-[var(--foreground-sutil)] flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatarTempoRelativo(pagina.atualizado_em)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Seção de Projetos & Quadros Kanban */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-sutil)] px-1">
            Projetos & Quadros Kanban ({projetos.length})
          </h2>
          <Link
            href={`${baseHref}/projetos`}
            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-medium"
          >
            <span>Ver todos os projetos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {projetos.length === 0 ? (
          <div className="superficie-glass p-8 rounded-[var(--raio-lg)] text-center border border-[var(--border)]">
            <FolderKanban className="h-8 w-8 mx-auto text-[var(--foreground-sutil)] mb-2" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Nenhum projeto cadastrado
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] max-w-xs mx-auto mt-1 mb-4">
              Gerencie suas entregas, tarefas e prazos com colunas visuais estilo Trello.
            </p>
            <ModalCriarProjeto workspaceId={workspaceId} textoBotao="Criar Primeiro Projeto" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projetos.map((proj) => (
              <Link
                key={proj.id}
                href={`${baseHref}/projetos/${proj.id}`}
                className="superficie-glass p-4 rounded-[var(--raio-md)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:scale-[1.01] flex flex-col justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--raio-sm)] text-white shadow-sm"
                    style={{ backgroundColor: proj.cor }}
                  >
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                      {proj.nome}
                    </h4>
                    <p className="text-xs text-[var(--foreground-muted)] truncate mt-0.5">
                      {proj.descricao || "Sem descrição"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--accent)] font-medium">
                  <span>Abrir Quadro</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
