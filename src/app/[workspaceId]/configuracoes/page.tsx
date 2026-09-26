import * as React from "react";
import Link from "next/link";
import { Users, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { obterPapelUsuarioWorkspace } from "@/lib/acoes/workspace-acoes";
import { FormularioEditarWorkspace } from "@/componentes/workspace/formulario-editar-workspace";
import { DialogExcluirWorkspace } from "@/componentes/workspace/dialog-excluir-workspace";

interface PropriedadesConfiguracoes {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function PaginaConfiguracoesWorkspace({
  params,
}: PropriedadesConfiguracoes) {
  const { workspaceId } = await params;
  const supabase = await criarClienteServidor();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  const papel = await obterPapelUsuarioWorkspace(workspaceId);
  const ehProprietario = papel === "proprietario";
  const podeEditar = papel === "proprietario" || papel === "admin";

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12" suppressHydrationWarning>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Configurações do Workspace
        </h1>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">
          Gerencie os detalhes, permissões e ciclo de vida deste ambiente de trabalho.
        </p>
      </div>

      {/* Grid de Atalhos / Subseções */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Card Membros */}
        <Link
          href={`/${workspaceId}/configuracoes/membros`}
          className="superficie-glass p-5 rounded-[var(--raio-lg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:scale-[1.01] flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--raio-md)] bg-[var(--accent)]/15 text-[var(--accent)]">
              <Users className="h-5 w-5" suppressHydrationWarning />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                Membros & Equipe
              </h3>
              <p className="text-xs text-[var(--foreground-muted)]">
                Convidar colegas e gerenciar permissões
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" suppressHydrationWarning />
        </Link>

        {/* Informações de Perfil de Acesso */}
        <div className="superficie-glass p-5 rounded-[var(--raio-lg)] border border-[var(--border)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-[var(--foreground-sutil)] uppercase tracking-wider">
              Seu Nível de Acesso
            </span>
            <p className="text-sm font-bold capitalize text-[var(--foreground)]">
              {papel || "Membro"}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">
              Slug: <span className="font-mono text-[var(--accent)]">/{workspace?.slug}</span>
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)] text-[var(--accent)] font-semibold text-xs">
            {workspace?.nome?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Card: Editar Detalhes do Workspace */}
      {workspace && (
        <div className="superficie-glass p-6 rounded-[var(--raio-lg)] border border-[var(--border)] space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Dados do Workspace
            </h2>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
              Edite o nome, a descrição e o tipo deste ambiente de colaboração.
            </p>
          </div>

          <FormularioEditarWorkspace
            workspace={{
              id: workspace.id,
              nome: workspace.nome,
              descricao: workspace.descricao,
              tipo: workspace.tipo,
              slug: workspace.slug,
            }}
            podeEditar={podeEditar}
          />
        </div>
      )}

      {/* Card: Zona de Perigo (Apenas Proprietário) */}
      {workspace && ehProprietario && (
        <DialogExcluirWorkspace
          workspaceId={workspace.id}
          nomeWorkspace={workspace.nome}
        />
      )}
    </div>
  );
}
