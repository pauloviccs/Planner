"use client";

import * as React from "react";
import {
  History,
  X,
  RefreshCw,
  FileText,
  FolderKanban,
  CheckSquare,
  MoveRight,
  Sparkles,
  User,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  obterAtividadesWorkspace,
  type AtividadeItem,
} from "@/lib/acoes/atividade-acoes";
import { usarRealtime } from "@/lib/hooks/usar-realtime";

interface PropriedadesPainelAtividades {
  workspaceId: string;
}

export function PainelAtividades({ workspaceId }: PropriedadesPainelAtividades) {
  const [aberto, setAberto] = React.useState(false);
  const [carregando, setCarregando] = React.useState(false);
  const [atividades, setAtividades] = React.useState<AtividadeItem[]>([]);

  const carregarAtividades = React.useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await obterAtividadesWorkspace(workspaceId, 25);
      setAtividades(dados);
    } catch (err) {
      console.error("Erro ao carregar atividades:", err);
    } finally {
      setCarregando(false);
    }
  }, [workspaceId]);

  // Carrega ao abrir o painel
  React.useEffect(() => {
    if (aberto) {
      carregarAtividades();
    }
  }, [aberto, carregarAtividades]);

  // Sincronização em tempo real das atividades via Supabase Realtime
  usarRealtime({
    tabela: "atividades",
    filtro: `workspace_id=eq.${workspaceId}`,
    aoMudar: () => {
      carregarAtividades();
    },
    ativo: aberto,
  });

  const formatarAcao = (item: AtividadeItem) => {
    const nomeAtor = item.perfis?.nome_completo || "Um membro";
    const titulo = item.detalhes?.titulo || "";

    switch (item.acao) {
      case "criou_cartao":
        return (
          <>
            <strong>{nomeAtor}</strong> criou a tarefa{" "}
            <span className="text-[var(--accent)] font-medium">"{titulo}"</span>
          </>
        );
      case "moveu_cartao":
        return (
          <>
            <strong>{nomeAtor}</strong> moveu a tarefa{" "}
            <span className="font-medium">"{titulo}"</span> para{" "}
            <span className="text-[var(--accent)] font-medium">
              {item.detalhes?.coluna}
            </span>
          </>
        );
      case "concluiu_cartao":
        return (
          <>
            <strong>{nomeAtor}</strong> concluiu a tarefa{" "}
            <span className="text-emerald-500 font-medium">"{titulo}"</span>
          </>
        );
      case "criou_pagina":
        return (
          <>
            <strong>{nomeAtor}</strong> criou a página{" "}
            <span className="text-[var(--accent)] font-medium">"{titulo}"</span>
          </>
        );
      case "editou_pagina":
        return (
          <>
            <strong>{nomeAtor}</strong> atualizou a página{" "}
            <span className="font-medium">"{titulo}"</span>
          </>
        );
      case "criou_projeto":
        return (
          <>
            <strong>{nomeAtor}</strong> criou o projeto{" "}
            <span className="text-[var(--accent)] font-medium">"{titulo}"</span>
          </>
        );
      default:
        return (
          <>
            <strong>{nomeAtor}</strong> realizou uma ação em{" "}
            <span className="font-medium">{item.recurso_tipo}</span>
          </>
        );
    }
  };

  const obterIconeRecurso = (tipo: string) => {
    switch (tipo) {
      case "cartao":
        return <CheckSquare className="h-3.5 w-3.5 text-blue-400" />;
      case "pagina":
        return <FileText className="h-3.5 w-3.5 text-amber-400" />;
      case "projeto":
        return <FolderKanban className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />;
    }
  };

  return (
    <>
      {/* Botão Gatilho na Barra Superior */}
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--raio-sm)] text-xs font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer"
        title="Histórico de atividades do workspace"
      >
        <History className="h-4 w-4" suppressHydrationWarning />
        <span className="hidden md:inline">Atividades</span>
      </button>

      {/* Gaveta Lateral (Slide-over) */}
      {aberto && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm superficie-glass border-l border-[var(--border)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              {/* Topo do Painel */}
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                    <History className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      Feed de Atividades
                    </h3>
                    <p className="text-[11px] text-[var(--foreground-muted)]">
                      Tempo real neste workspace
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={carregarAtividades}
                    disabled={carregando}
                    className="p-1.5 rounded text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    title="Atualizar"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${carregando ? "animate-spin" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => setAberto(false)}
                    className="p-1.5 rounded text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    title="Fechar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Lista de Atividades */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {carregando && atividades.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--foreground-muted)]">
                    Carregando atividades...
                  </div>
                ) : atividades.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <History className="h-8 w-8 mx-auto text-[var(--foreground-muted)] opacity-40" />
                    <p className="text-xs text-[var(--foreground-muted)]">
                      Nenhuma atividade recente registrada.
                    </p>
                  </div>
                ) : (
                  atividades.map((item) => (
                    <div
                      key={item.id}
                      className="superficie-glass p-3 rounded-[var(--raio-sm)] border border-[var(--border)] text-xs space-y-1.5 shadow-2xs hover:border-[var(--accent)]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {obterIconeRecurso(item.recurso_tipo)}
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--foreground-muted)]">
                            {item.recurso_tipo}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--foreground-muted)] font-mono">
                          {formatDistanceToNow(parseISO(item.criado_em), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>

                      <p className="text-[var(--foreground)] text-xs leading-snug">
                        {formatarAcao(item)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Rodapé com contagem */}
              <div className="p-3 border-t border-[var(--border)] text-center text-[11px] text-[var(--foreground-muted)] bg-[var(--surface-elevada)]/50">
                Mostrando {atividades.length} atividades mais recentes
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
