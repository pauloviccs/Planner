import * as React from "react";
import Link from "next/link";
import { Users, UserPlus, ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { obterMembrosWorkspace } from "@/lib/acoes/membro-acoes";
import { FormularioConvidarMembro } from "@/componentes/configuracoes/formulario-convidar-membro";
import { Avatar } from "@/componentes/ui/avatar";
import { Badge } from "@/componentes/ui/badge";

interface PropriedadesMembros {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function PaginaMembrosWorkspace({
  params,
}: PropriedadesMembros) {
  const { workspaceId } = await params;
  const membros = await obterMembrosWorkspace(workspaceId);

  const papelBadge: Record<
    string,
    { rotulo: string; variante: "padrao" | "sucesso" | "aviso" | "info" | "secundario" }
  > = {
    proprietario: { rotulo: "Proprietário", variante: "padrao" },
    admin: { rotulo: "Administrador", variante: "info" },
    membro: { rotulo: "Membro", variante: "secundario" },
    convidado: { rotulo: "Convidado", variante: "aviso" },
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <Link
          href={`/${workspaceId}/configuracoes`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar para configurações</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Membros do Workspace
            </h1>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              Gerencie as pessoas que têm acesso a este espaço de trabalho e seus níveis de permissão.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lista de Membros */}
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-sutil)] px-1">
            Membros Ativos ({membros.length})
          </h2>

          <div className="superficie-glass rounded-[var(--raio-lg)] border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
            {membros.map((m) => {
              const badge = papelBadge[m.papel] || { rotulo: m.papel, variante: "secundario" };
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 hover:bg-[var(--surface-elevada)]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      url={m.perfil?.avatar_url}
                      nome={m.perfil?.nome_completo || m.perfil?.email}
                      tamanho="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                        {m.perfil?.nome_completo || "Usuário"}
                      </p>
                      <p className="text-[11px] text-[var(--foreground-muted)] truncate flex items-center gap-1">
                        <Mail className="h-3 w-3 opacity-60" />
                        {m.perfil?.email}
                      </p>
                    </div>
                  </div>

                  <Badge variante={badge.variante} tamanho="sm">
                    {badge.rotulo}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulário de Convite */}
        <div className="superficie-glass p-5 rounded-[var(--raio-lg)] border border-[var(--border)] shadow-[var(--sombra-sm)] space-y-3 h-fit">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Convidar Membro
            </h3>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
            Adicione colegas pelo e-mail já cadastrado no VICCS Planner.
          </p>

          <FormularioConvidarMembro workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}
