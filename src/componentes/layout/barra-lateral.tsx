"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  FolderKanban,
  Star,
  Clock,
  Settings,
  Plus,
  Search,
  LayoutDashboard,
  ChevronsUpDown,
  Database,
  BarChart3,
} from "lucide-react";
import type { PaginaResumo } from "@/lib/acoes/pagina-acoes";
import { criarPaginaAcao } from "@/lib/acoes/pagina-acoes";

import { cn } from "@/lib/utilitarios";

interface PropsBarraLateral {
  recolhida: boolean;
  aoAlternarRecolhimento: () => void;
  aoAbrirBusca?: () => void;
  workspaceId?: string;
  nomeWorkspace?: string;
  paginas?: PaginaResumo[];
}

export function BarraLateral({
  recolhida,
  aoAlternarRecolhimento,
  aoAbrirBusca,
  workspaceId = "padrao",
  nomeWorkspace = "Meu Workspace",
  paginas = [],
}: PropsBarraLateral) {
  const pathname = usePathname();
  const router = useRouter();
  const [criandoPagina, setCriandoPagina] = React.useState(false);

  const baseHref = `/${workspaceId}`;

  const itensNavegacao = [
    {
      id: "inicio",
      rotulo: "Início",
      icone: LayoutDashboard,
      href: baseHref,
      exato: true,
    },
    {
      id: "dashboard",
      rotulo: "Dashboard",
      icone: BarChart3,
      href: `${baseHref}/dashboard`,
      exato: false,
    },
    {
      id: "paginas",
      rotulo: "Páginas",
      icone: FileText,
      href: `${baseHref}/paginas`,
      exato: false,
    },
    {
      id: "projetos",
      rotulo: "Projetos",
      icone: FolderKanban,
      href: `${baseHref}/projetos`,
      exato: false,
    },
    {
      id: "bancos",
      rotulo: "Bases de Dados",
      icone: Database,
      href: `${baseHref}/bancos`,
      exato: false,
    },
  ];

  const aoCriarPaginaRapida = async () => {
    if (criandoPagina) return;
    setCriandoPagina(true);
    try {
      const res = await criarPaginaAcao(workspaceId, "Nova Página");
      if (res.sucesso && res.pagina) {
        router.push(`${baseHref}/paginas/${res.pagina.id}`);
        router.refresh();
      }
    } finally {
      setCriandoPagina(false);
    }
  };

  const paginasFavoritas = paginas.filter((p) => p.favorita);
  const paginasGerais = paginas.slice(0, 8);

  return (
    <aside
      className="superficie-glass transicao-transform fixed left-0 top-0 z-30 flex h-screen flex-col overflow-hidden border-r border-[var(--border)] rounded-none"
      style={{
        width: recolhida
          ? "var(--sidebar-largura-recolhida)"
          : "var(--sidebar-largura)",
      }}
      suppressHydrationWarning
    >
      {/* Cabeçalho da sidebar com seletor de workspace */}
      <div
        className="flex items-center justify-between px-3 h-[var(--topbar-altura)] border-b border-[var(--border)]"
        suppressHydrationWarning
      >
        {!recolhida && (
          <Link
            href="/selecionar-workspace"
            className="flex items-center gap-2 overflow-hidden flex-1 group hover:opacity-85 transition-opacity"
            title="Trocar de workspace"
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-bold text-white shadow-xs text-xs bg-gradient-to-br from-[var(--accent)] to-indigo-600"
              suppressHydrationWarning
            >
              {nomeWorkspace.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden text-left flex-1 min-w-0">
              <span className="truncate font-semibold text-xs text-[var(--foreground)]">
                {nomeWorkspace}
              </span>
              <span className="text-[10px] text-[var(--foreground-muted)] flex items-center gap-0.5">
                <span>Workspace</span>
                <ChevronsUpDown className="h-2.5 w-2.5 opacity-60" suppressHydrationWarning />
              </span>
            </div>
          </Link>
        )}

        <button
          onClick={aoAlternarRecolhimento}
          className="transicao-cores flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-[var(--surface-elevada)] text-[var(--foreground-muted)] cursor-pointer"
          aria-label={recolhida ? "Expandir barra lateral" : "Recolher barra lateral"}
          title={recolhida ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          <ChevronLeft
            size={16}
            suppressHydrationWarning
            className={cn(
              "transicao-transform duration-200",
              recolhida ? "rotate-180" : "rotate-0"
            )}
          />
        </button>
      </div>

      {/* Busca rápida */}
      {!recolhida && (
        <div className="px-3 py-2">
          <button
            onClick={aoAbrirBusca}
            className="transicao-cores flex w-full items-center gap-2 rounded-md px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-sutil)] text-xs cursor-pointer hover:border-[var(--border-hover)]"
          >
            <Search size={14} suppressHydrationWarning />
            <span>Buscar...</span>
            <kbd className="ml-auto rounded px-1.5 py-0.5 text-[10px] bg-[var(--surface-elevada)] border border-[var(--border)] text-[var(--foreground-sutil)] font-mono">
              Ctrl K
            </kbd>
          </button>
        </div>
      )}

      {/* Navegação principal */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {/* Botão de ação rápida: Criar nova página */}
        <button
          onClick={aoCriarPaginaRapida}
          disabled={criandoPagina}
          className="transicao-cores flex w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50"
          title="Nova página rápida"
        >
          <Plus size={15} suppressHydrationWarning />
          {!recolhida && <span>{criandoPagina ? "Criando..." : "Nova Página"}</span>}
        </button>

        {/* Links de navegação principais */}
        <ul className="space-y-0.5">
          {itensNavegacao.map((item) => {
            const ativo = item.exato
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "transicao-cores flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer",
                    ativo
                      ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                      : "bg-transparent text-[var(--foreground-muted)] hover:bg-[var(--surface-elevada)] hover:text-[var(--foreground)]"
                  )}
                  title={item.rotulo}
                >
                  <item.icone size={16} strokeWidth={ativo ? 2.2 : 1.8} suppressHydrationWarning />
                  {!recolhida && <span>{item.rotulo}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Seção Páginas Favoritas */}
        {!recolhida && paginasFavoritas.length > 0 && (
          <div className="pt-2">
            <div className="px-2 py-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-sutil)]">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500/20" suppressHydrationWarning />
                Favoritos
              </span>
            </div>
            <ul className="space-y-0.5 mt-1">
              {paginasFavoritas.map((pag) => (
                <li key={pag.id}>
                  <Link
                    href={`${baseHref}/paginas/${pag.id}`}
                    className="flex items-center gap-2 px-2.5 py-1 rounded text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)] truncate transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" suppressHydrationWarning />
                    <span className="truncate">{pag.titulo || "Sem título"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Seção Lista de Páginas do Workspace */}
        {!recolhida && paginasGerais.length > 0 && (
          <div className="pt-2 border-t border-[var(--border)]">
            <div className="px-2 py-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-sutil)]">
              <span>Documentos</span>
              <button
                onClick={aoCriarPaginaRapida}
                className="hover:text-[var(--accent)] cursor-pointer"
                title="Criar página"
              >
                <Plus className="h-3.5 w-3.5" suppressHydrationWarning />
              </button>
            </div>
            <ul className="space-y-0.5 mt-1">
              {paginasGerais.map((pag) => {
                const ativo = pathname === `${baseHref}/paginas/${pag.id}`;
                return (
                  <li key={pag.id}>
                    <Link
                      href={`${baseHref}/paginas/${pag.id}`}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1 rounded text-xs truncate transition-colors",
                        ativo
                          ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                          : "bg-transparent text-[var(--foreground-muted)] hover:bg-[var(--surface-elevada)] hover:text-[var(--foreground)]"
                      )}
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" suppressHydrationWarning />
                      <span className="truncate">{pag.titulo || "Sem título"}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Rodapé da sidebar com configurações */}
      <div className="px-2 py-2 border-t border-[var(--border)]">
        <Link
          href={`${baseHref}/configuracoes`}
          className="transicao-cores flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
          title="Configurações do workspace"
        >
          <Settings size={16} strokeWidth={1.8} suppressHydrationWarning />
          {!recolhida && <span>Configurações</span>}
        </Link>
      </div>
    </aside>
  );
}
