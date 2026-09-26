"use client";

import { Menu } from "lucide-react";
import { AlternadorTema } from "@/componentes/layout/alternador-tema";
import { MenuUsuario } from "@/componentes/layout/menu-usuario";
import { CentralNotificacoes } from "@/componentes/layout/central-notificacoes";
import { PainelAtividades } from "@/componentes/workspace/painel-atividades";

interface PropsBarraSuperior {
  sidebarRecolhida: boolean;
  aoAlternarSidebar: () => void;
  tituloAtual?: string;
  workspaceId?: string;
  usuario?: {
    id: string;
    email: string;
    nome_completo?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function BarraSuperior({
  sidebarRecolhida,
  aoAlternarSidebar,
  tituloAtual = "Início",
  workspaceId,
  usuario,
}: PropsBarraSuperior) {
  return (
    <header
      className="superficie-glass fixed right-0 top-0 z-20 flex items-center justify-between px-4 border-b border-[var(--border)] rounded-none h-[var(--topbar-altura)]"
      style={{
        left: sidebarRecolhida
          ? "var(--sidebar-largura-recolhida)"
          : "var(--sidebar-largura)",
        transition: "left var(--duracao-normal) var(--easing-padrao)",
      }}
      suppressHydrationWarning
    >
      {/* Lado esquerdo: breadcrumbs / título da página */}
      <div className="flex items-center gap-3">
        {/* Botão hamburger para mobile */}
        <button
          onClick={aoAlternarSidebar}
          className="transicao-cores flex h-8 w-8 items-center justify-center rounded-md lg:hidden text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          aria-label="Alternar menu"
        >
          <Menu size={18} suppressHydrationWarning />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Navegação por trilha" className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-[var(--foreground)]">
            {tituloAtual}
          </span>
        </nav>
      </div>

      {/* Lado direito: ações */}
      <div className="flex items-center gap-2.5">
        <AlternadorTema />

        {/* Feed de Atividades do Workspace */}
        {workspaceId && workspaceId !== "padrao" && (
          <PainelAtividades workspaceId={workspaceId} />
        )}

        {/* Central de Notificações com Badge e Dropdown */}
        <CentralNotificacoes />

        {/* Menu do Usuário com avatar */}
        <MenuUsuario usuario={usuario} />
      </div>
    </header>
  );
}

