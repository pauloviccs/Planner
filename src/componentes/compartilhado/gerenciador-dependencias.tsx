"use client";

import * as React from "react";
import {
  Link2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import {
  obterDependenciasDoCartao,
  adicionarDependenciaAcao,
  removerDependenciaAcao,
  type DependenciasResultado,
} from "@/lib/acoes/dependencia-acoes";
import type { ColunaComCartoes } from "@/lib/acoes/projeto-acoes";

interface PropriedadesGerenciadorDependencias {
  workspaceId: string;
  cartaoId: string;
  colunas: ColunaComCartoes[];
}

export function GerenciadorDependencias({
  workspaceId,
  cartaoId,
  colunas,
}: PropriedadesGerenciadorDependencias) {
  const [dependencias, setDependencias] = React.useState<DependenciasResultado>({
    bloqueadores: [],
    bloqueados: [],
  });
  const [carregando, setCarregando] = React.useState(true);
  const [adicionando, setAdicionando] = React.useState(false);
  const [cartaoSelecionado, setCartaoSelecionado] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  // Lista plana de todos os outros cartões disponíveis no projeto
  const outrosCartoes = React.useMemo(() => {
    return colunas
      .flatMap((c) => c.cartoes)
      .filter((c) => c.id !== cartaoId);
  }, [colunas, cartaoId]);

  const carregar = React.useCallback(async () => {
    try {
      setCarregando(true);
      const res = await obterDependenciasDoCartao(cartaoId);
      setDependencias(res);
    } catch (err) {
      console.error("Erro ao carregar dependências:", err);
    } finally {
      setCarregando(false);
    }
  }, [cartaoId]);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  const lidarComAdicionar = async () => {
    if (!cartaoSelecionado) return;
    setSalvando(true);
    setErro(null);

    try {
      const res = await adicionarDependenciaAcao(workspaceId, cartaoId, cartaoSelecionado);
      if (res.sucesso) {
        setCartaoSelecionado("");
        setAdicionando(false);
        carregar();
      } else {
        setErro(res.erro || "Falha ao vincular dependência.");
      }
    } catch (err: any) {
      setErro(err?.message || "Erro desconhecido ao adicionar dependência.");
    } finally {
      setSalvando(false);
    }
  };

  const lidarComRemover = async (dependenciaId: string) => {
    try {
      const res = await removerDependenciaAcao(dependenciaId, workspaceId);
      if (res.sucesso) {
        carregar();
      }
    } catch (err) {
      console.error("Erro ao remover dependência:", err);
    }
  };

  const temBloqueioAtivo = dependencias.bloqueadores.some((b) => !b.concluido);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-amber-400" suppressHydrationWarning />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Dependências & Relações
          </h4>
        </div>

        {!adicionando && (
          <button
            type="button"
            onClick={() => setAdicionando(true)}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" suppressHydrationWarning />
            <span>Adicionar Bloqueador</span>
          </button>
        )}
      </div>

      {/* Alerta se o cartão estiver atualmente bloqueado */}
      {temBloqueioAtivo && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" suppressHydrationWarning />
          <span>
            Esta tarefa possui dependências pendentes e está aguardando conclusão anterior.
          </span>
        </div>
      )}

      {/* Formulário para adicionar nova dependência */}
      {adicionando && (
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-amber-500/20 space-y-2 text-xs">
          <div className="font-medium text-zinc-300">
            Esta tarefa depende de (está bloqueada por):
          </div>

          <div className="flex items-center gap-2">
            <select
              value={cartaoSelecionado}
              onChange={(e) => setCartaoSelecionado(e.target.value)}
              className="flex-1 h-8 px-2 rounded-lg bg-zinc-800 text-zinc-100 border border-white/10 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="">Selecione uma tarefa precursora...</option>
              {outrosCartoes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={lidarComAdicionar}
              disabled={!cartaoSelecionado || salvando}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
            >
              {salvando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Vincular"}
            </button>

            <button
              type="button"
              onClick={() => {
                setAdicionando(false);
                setErro(null);
              }}
              className="px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-muted-foreground transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          {erro && <p className="text-[11px] text-rose-400">{erro}</p>}
        </div>
      )}

      {/* Lista de quem bloqueia esta tarefa */}
      {carregando ? (
        <div className="h-10 rounded-lg bg-zinc-800/20 animate-pulse" />
      ) : (
        <div className="space-y-1.5">
          {dependencias.bloqueadores.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">
                Bloqueado por ({dependencias.bloqueadores.length}):
              </span>
              {dependencias.bloqueadores.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/40 border border-white/5 text-xs group"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {b.concluido ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" suppressHydrationWarning />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" suppressHydrationWarning />
                    )}
                    <span
                      className={`truncate ${
                        b.concluido ? "line-through text-muted-foreground" : "text-foreground font-medium"
                      }`}
                    >
                      {b.titulo}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                      {b.coluna_titulo}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => lidarComRemover(b.id)}
                    className="p-1 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Remover dependência"
                  >
                    <Trash2 className="w-3.5 h-3.5" suppressHydrationWarning />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Lista de tarefas que este cartão bloqueia */}
          {dependencias.bloqueados.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Bloqueia o progresso de ({dependencias.bloqueados.length}):
              </span>
              {dependencias.bloqueados.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/40 border border-white/5 text-xs text-muted-foreground group"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span className="truncate">{b.titulo}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                      {b.coluna_titulo}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => lidarComRemover(b.id)}
                    className="p-1 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Remover dependência"
                  >
                    <Trash2 className="w-3.5 h-3.5" suppressHydrationWarning />
                  </button>
                </div>
              ))}
            </div>
          )}

          {dependencias.bloqueadores.length === 0 && dependencias.bloqueados.length === 0 && !adicionando && (
            <div className="text-[11px] text-muted-foreground py-1">
              Nenhuma dependência definida para esta tarefa.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
