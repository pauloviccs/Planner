import * as React from "react";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { obterWorkspacesDoUsuario } from "@/lib/acoes/workspace-acoes";
import { FormularioCriarWorkspace } from "./formulario-criar-workspace";
import { ItemWorkspaceCard } from "./item-workspace-card";
import { AlternadorTema } from "@/componentes/layout/alternador-tema";
import { MenuUsuario } from "@/componentes/layout/menu-usuario";
import { LayoutGrid } from "lucide-react";

export default async function PaginaSelecionarWorkspace() {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  // Busca dados do perfil do usuário
  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", user.id)
    .single();

  const workspaces = await obterWorkspacesDoUsuario();

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]" suppressHydrationWarning>
      {/* Luz ambiente de fundo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" suppressHydrationWarning>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[140px]" />
      </div>

      {/* Header superior */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border)]" suppressHydrationWarning>
        <div className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-[var(--foreground)]" suppressHydrationWarning>
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--raio-md)] bg-[var(--accent)] text-white shadow-xs" suppressHydrationWarning>
            <LayoutGrid className="h-4 w-4" />
          </div>
          <span>VICCS Planner</span>
        </div>

        <div className="flex items-center gap-3" suppressHydrationWarning>
          <AlternadorTema />
          <MenuUsuario
            usuario={{
              id: user.id,
              email: user.email || "",
              nome_completo: perfil?.nome_completo || user.email,
              avatar_url: perfil?.avatar_url,
            }}
          />
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 flex flex-col justify-center" suppressHydrationWarning>
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Selecione seu Workspace
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] max-w-md mx-auto">
            Escolha o espaço de trabalho que deseja acessar ou crie um novo para sua equipe.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 items-start">
          {/* Lista de Workspaces Existentes */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-sutil)] px-1">
              Seus Workspaces ({workspaces.length})
            </h2>

            <div className="space-y-2.5">
              {workspaces.map((ws) => (
                <ItemWorkspaceCard key={ws.id} workspace={ws} />
              ))}
            </div>
          </div>

          {/* Card de Criação de Novo Workspace */}
          <div className="superficie-glass p-5 rounded-[var(--raio-lg)] border border-[var(--border)] shadow-[var(--sombra-md)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">
              Criar Novo Workspace
            </h2>
            <p className="text-xs text-[var(--foreground-muted)] mb-4">
              Crie um novo ambiente para separar seus projetos, notas e equipes.
            </p>

            <FormularioCriarWorkspace />
          </div>
        </div>
      </main>
    </div>
  );
}
