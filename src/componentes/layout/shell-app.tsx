"use client";

import * as React from "react";
import { BarraLateral } from "@/componentes/layout/barra-lateral";
import { BarraSuperior } from "@/componentes/layout/barra-superior";
import { ModalBuscaGlobal } from "@/componentes/busca/modal-busca-global";
import type { PaginaResumo } from "@/lib/acoes/pagina-acoes";
import type { ProjetoResumo } from "@/lib/acoes/projeto-acoes";

interface PropriedadesShellApp {
  children: React.ReactNode;
  workspaceId?: string;
  nomeWorkspace?: string;
  paginas?: PaginaResumo[];
  projetos?: ProjetoResumo[];
  tituloAtual?: string;
  usuario?: {
    id: string;
    email: string;
    nome_completo?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function ShellApp({
  children,
  workspaceId = "padrao",
  nomeWorkspace = "Meu Workspace",
  paginas = [],
  projetos = [],
  tituloAtual = "Início",
  usuario,
}: PropriedadesShellApp) {
  const [sidebarRecolhida, setSidebarRecolhida] = React.useState(false);
  const [buscaAberta, setBuscaAberta] = React.useState(false);

  const alternarSidebar = () => setSidebarRecolhida((prev) => !prev);

  // Escuta atalho Ctrl+K / Cmd+K para busca global
  React.useEffect(() => {
    const tratarKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBuscaAberta((prev) => !prev);
      }
      if (e.key === "Escape") {
        setBuscaAberta(false);
      }
    };

    window.addEventListener("keydown", tratarKeyDown);
    return () => window.removeEventListener("keydown", tratarKeyDown);
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]"
      suppressHydrationWarning
    >
      <BarraLateral
        recolhida={sidebarRecolhida}
        aoAlternarRecolhimento={alternarSidebar}
        aoAbrirBusca={() => setBuscaAberta(true)}
        workspaceId={workspaceId}
        nomeWorkspace={nomeWorkspace}
        paginas={paginas}
      />
      <BarraSuperior
        sidebarRecolhida={sidebarRecolhida}
        aoAlternarSidebar={alternarSidebar}
        tituloAtual={tituloAtual}
        workspaceId={workspaceId}
        usuario={usuario}
      />

      {/* Área de conteúdo principal */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          marginLeft: sidebarRecolhida
            ? "var(--sidebar-largura-recolhida)"
            : "var(--sidebar-largura)",
          marginTop: "var(--topbar-altura)",
          padding: "var(--espaco-6)",
          transition: "margin-left var(--duracao-normal) var(--easing-padrao)",
        }}
        suppressHydrationWarning
      >
        {children}
      </main>

      {/* Modal de Busca Global */}
      <ModalBuscaGlobal
        workspaceId={workspaceId}
        paginas={paginas}
        projetos={projetos}
        aberto={buscaAberta}
        aoFechar={() => setBuscaAberta(false)}
      />
    </div>
  );
}
