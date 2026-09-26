"use client";

import * as React from "react";
import { Bell, Check, Clock, Inbox } from "lucide-react";
import { formatarTempoRelativo } from "@/lib/utilitarios";

interface NotificacaoItem {
  id: string;
  titulo: string;
  descricao: string;
  lida: boolean;
  tempo: string;
}

export function CentralNotificacoes() {
  const [aberto, setAberto] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [notificacoes, setNotificacoes] = React.useState<NotificacaoItem[]>([
    {
      id: "1",
      titulo: "Workspace configurado",
      descricao: "Seu espaço de trabalho está pronto para uso e personalização.",
      lida: false,
      tempo: new Date().toISOString(),
    },
  ]);

  const temNaoLidas = notificacoes.some((n) => !n.lida);

  React.useEffect(() => {
    function tratarCliqueFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const aoMarcarTodasComoLidas = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setAberto(!aberto)}
        className="transicao-cores relative flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)] cursor-pointer"
        aria-label="Abrir central de notificações"
        title="Notificações"
      >
        <Bell size={18} strokeWidth={1.8} suppressHydrationWarning />
        {temNaoLidas && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--perigo)] ring-2 ring-[var(--surface)]" />
        )}
      </button>

      {aberto && (
        <div className="superficie-glass absolute right-0 mt-2 w-80 rounded-[var(--raio-md)] shadow-[var(--sombra-lg)] z-50 border border-[var(--border)] overflow-hidden animate-in fade-in duration-100">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--border)]">
            <h4 className="text-xs font-semibold text-[var(--foreground)]">
              Notificações
            </h4>
            {temNaoLidas && (
              <button
                onClick={aoMarcarTodasComoLidas}
                className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Check className="h-3 w-3" />
                <span>Marcar lidas</span>
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]/50">
            {notificacoes.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--foreground-muted)]">
                <Inbox className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
                <span>Nenhuma notificação recente.</span>
              </div>
            ) : (
              notificacoes.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 text-xs space-y-1 transition-colors ${
                    !item.lida ? "bg-[var(--surface-elevada)]/40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--foreground)] truncate">
                      {item.titulo}
                    </span>
                    <span className="text-[10px] text-[var(--foreground-sutil)] shrink-0 flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {formatarTempoRelativo(item.tempo)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                    {item.descricao}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
