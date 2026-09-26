import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  CheckCircle2,
  Clock,
  Database,
  Users,
  ArrowRight,
  Plus,
  Sparkles,
} from "lucide-react";
import { obterMetricasWorkspaceAcao } from "@/lib/acoes/banco-dados-acoes";

interface PropriedadesPaginaDashboard {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function PaginaDashboardWorkspace({
  params,
}: PropriedadesPaginaDashboard) {
  const { workspaceId } = await params;
  const metricas = await obterMetricasWorkspaceAcao(workspaceId);

  const taxaConclusao =
    metricas.totalTarefas > 0
      ? Math.round((metricas.tarefasConcluidas / metricas.totalTarefas) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
          <LayoutDashboard className="h-6 w-6 text-[var(--accent)]" />
          <span>Visão Geral & Dashboard</span>
        </h1>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">
          Acompanhe o volume de entregas, saúde dos projetos e produtividade da equipe no workspace.
        </p>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tarefas Concluídas / Progresso */}
        <div className="superficie-glass border border-[var(--border)] rounded-[var(--raio-lg)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--foreground-muted)]">
              Taxa de Conclusão
            </span>
            <div className="p-2 rounded-[var(--raio-md)] bg-[var(--sucesso-fundo)] text-[var(--sucesso)]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {taxaConclusao}%
            </div>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
              {metricas.tarefasConcluidas} de {metricas.totalTarefas} tarefas finalizadas
            </p>
          </div>
          {/* Barra de progresso */}
          <div className="w-full bg-[var(--surface-elevada)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--sucesso)] h-full rounded-full transition-all duration-500"
              style={{ width: `${taxaConclusao}%` }}
            />
          </div>
        </div>

        {/* Card 2: Projetos e Quadros */}
        <div className="superficie-glass border border-[var(--border)] rounded-[var(--raio-lg)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--foreground-muted)]">
              Projetos & Quadros
            </span>
            <div className="p-2 rounded-[var(--raio-md)] bg-[var(--accent)]/10 text-[var(--accent)]">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {metricas.totalProjetos}
            </div>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
              {metricas.tarefasPendentes} tarefas em andamento
            </p>
          </div>
          <Link
            href={`/${workspaceId}/projetos`}
            className="text-[11px] font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1"
          >
            <span>Ver quadros Kanban</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 3: Páginas e Notas */}
        <div className="superficie-glass border border-[var(--border)] rounded-[var(--raio-lg)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--foreground-muted)]">
              Páginas de Documentação
            </span>
            <div className="p-2 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] text-[var(--foreground)]">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {metricas.totalPaginas}
            </div>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
              Documentos ricos criados
            </p>
          </div>
          <Link
            href={`/${workspaceId}/paginas`}
            className="text-[11px] font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1"
          >
            <span>Explorar páginas</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 4: Bases de Dados Dinâmicas */}
        <div className="superficie-glass border border-[var(--border)] rounded-[var(--raio-lg)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--foreground-muted)]">
              Bases de Dados
            </span>
            <div className="p-2 rounded-[var(--raio-md)] bg-[var(--accent)]/10 text-[var(--accent)]">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {metricas.totalBancos}
            </div>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
              Tabelas estilo Notion configuradas
            </p>
          </div>
          <Link
            href={`/${workspaceId}/bancos`}
            className="text-[11px] font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1"
          >
            <span>Gerenciar bases</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Ações Rápidas & Guia de Produtividade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 superficie-glass border border-[var(--border)] rounded-[var(--raio-xl)] p-6 space-y-4">
          <h2 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider text-[var(--foreground-sutil)]">
            Ações Rápidas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href={`/${workspaceId}/paginas`}
              className="p-4 rounded-[var(--raio-lg)] border border-[var(--border)] bg-[var(--surface-elevada)]/40 hover:bg-[var(--surface-elevada)] hover:border-[var(--accent)] transition-all flex items-start gap-3 group"
            >
              <div className="p-2 rounded bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  Nova Página
                </h3>
                <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                  Crie notas, atas de reuniões ou wikis com Tiptap.
                </p>
              </div>
            </Link>

            <Link
              href={`/${workspaceId}/projetos`}
              className="p-4 rounded-[var(--raio-lg)] border border-[var(--border)] bg-[var(--surface-elevada)]/40 hover:bg-[var(--surface-elevada)] hover:border-[var(--accent)] transition-all flex items-start gap-3 group"
            >
              <div className="p-2 rounded bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                <FolderKanban className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  Novo Projeto Kanban
                </h3>
                <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                  Organize fluxos de entrega em colunas e cartões interativos.
                </p>
              </div>
            </Link>

            <Link
              href={`/${workspaceId}/bancos`}
              className="p-4 rounded-[var(--raio-lg)] border border-[var(--border)] bg-[var(--surface-elevada)]/40 hover:bg-[var(--surface-elevada)] hover:border-[var(--accent)] transition-all flex items-start gap-3 group"
            >
              <div className="p-2 rounded bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  Nova Base de Dados
                </h3>
                <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                  Monte planilhas com colunas tipadas e visualização em galeria.
                </p>
              </div>
            </Link>

            <Link
              href={`/${workspaceId}/configuracoes/membros`}
              className="p-4 rounded-[var(--raio-lg)] border border-[var(--border)] bg-[var(--surface-elevada)]/40 hover:bg-[var(--surface-elevada)] hover:border-[var(--accent)] transition-all flex items-start gap-3 group"
            >
              <div className="p-2 rounded bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  Convidar Membros
                </h3>
                <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                  Adicione colegas de equipe e atribua permissões de acesso.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Card Lateral: Membros e Info do Workspace */}
        <div className="superficie-glass border border-[var(--border)] rounded-[var(--raio-xl)] p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Equipe do Workspace
            </h2>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
            Atualmente há <strong>{metricas.totalMembros}</strong> membros colaborando neste espaço.
          </p>
          <div className="pt-2">
            <Link
              href={`/${workspaceId}/configuracoes/membros`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>Gerenciar acessos e papéis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
