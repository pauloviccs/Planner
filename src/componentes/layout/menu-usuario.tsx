"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, User, Building, Settings } from "lucide-react";
import { Avatar } from "@/componentes/ui/avatar";
import { sairAcao } from "@/lib/acoes/auth-acoes";

interface PropriedadesMenuUsuario {
  usuario?: {
    id: string;
    email: string;
    nome_completo?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function MenuUsuario({ usuario }: PropriedadesMenuUsuario) {
  const [aberto, setAberto] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function tratarCliqueFora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    if (aberto) {
      document.addEventListener("mousedown", tratarCliqueFora);
    }
    return () => {
      document.removeEventListener("mousedown", tratarCliqueFora);
    };
  }, [aberto]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] p-0.5"
        aria-label="Abrir menu de usuário"
      >
        <Avatar
          url={usuario?.avatar_url}
          nome={usuario?.nome_completo || usuario?.email || "Usuário"}
          tamanho="sm"
        />
      </button>

      {aberto && (
        <div className="superficie-glass absolute right-0 mt-2 w-56 rounded-[var(--raio-md)] p-1.5 shadow-[var(--sombra-lg)] z-50 animate-in fade-in zoom-in-95 duration-100 border border-[var(--border)]">
          {/* Dados do Usuário */}
          <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
            <p className="text-xs font-semibold text-[var(--foreground)] truncate">
              {usuario?.nome_completo || "Usuário"}
            </p>
            <p className="text-[11px] text-[var(--foreground-muted)] truncate">
              {usuario?.email}
            </p>
          </div>

          <div className="space-y-0.5">
            <Link
              href="/selecionar-workspace"
              onClick={() => setAberto(false)}
              className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--surface-elevada)] transition-colors"
            >
              <Building className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
              <span>Trocar de Workspace</span>
            </Link>

            <Link
              href="/perfil"
              onClick={() => setAberto(false)}
              className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--surface-elevada)] transition-colors"
            >
              <User className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
              <span>Meu Perfil</span>
            </Link>

            <Link
              href="/configuracoes"
              onClick={() => setAberto(false)}
              className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--surface-elevada)] transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
              <span>Configurações</span>
            </Link>
          </div>

          <div className="mt-1 pt-1 border-t border-[var(--border)]">
            <button
              onClick={() => sairAcao()}
              className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-[var(--perigo)] hover:bg-[var(--perigo-fundo)] transition-colors font-medium text-left cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
