"use client";

import * as React from "react";
import {
  Calendar,
  CheckSquare,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import type { QuadroDetalhe, CartaoCompleto } from "@/lib/acoes/projeto-acoes";
import { formatarDataPtBr } from "@/lib/utilitarios";
import { Badge } from "@/componentes/ui/badge";
import { DialogCartao } from "./dialog-cartao";

interface PropriedadesTabelaKanban {
  quadro: QuadroDetalhe;
  aoAtualizar: () => void;
}

export function TabelaKanban({ quadro, aoAtualizar }: PropriedadesTabelaKanban) {
  const [busca, setBusca] = React.useState("");
  const [filtroColuna, setFiltroColuna] = React.useState("todas");
  const [filtroPrioridade, setFiltroPrioridade] = React.useState("todas");
  const [cartaoSelecionado, setCartaoSelecionado] = React.useState<CartaoCompleto | null>(null);

  // Consolida todos os cartões com suas respectivas colunas
  const todosCartoes = React.useMemo(() => {
    return quadro.colunas.flatMap((col) =>
      col.cartoes.map((c) => ({
        ...c,
        nomeColuna: col.titulo,
        corColuna: col.cor,
      }))
    );
  }, [quadro.colunas]);

  // Filtra os cartões por busca, coluna e prioridade
  const cartoesFiltrados = React.useMemo(() => {
    return todosCartoes.filter((c) => {
      const bateBusca =
        !busca.trim() ||
        c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        (c.descricao && c.descricao.toLowerCase().includes(busca.toLowerCase()));

      const bateColuna = filtroColuna === "todas" || c.coluna_id === filtroColuna;
      const batePrioridade =
        filtroPrioridade === "todas" || c.prioridade === filtroPrioridade;

      return bateBusca && bateColuna && batePrioridade;
    });
  }, [todosCartoes, busca, filtroColuna, filtroPrioridade]);

  const prioridadeVariante: Record<
    string,
    { rotulo: string; variante: "padrao" | "sucesso" | "aviso" | "perigo" | "info" | "secundario" }
  > = {
    baixa: { rotulo: "Baixa", variante: "info" },
    media: { rotulo: "Média", variante: "aviso" },
    alta: { rotulo: "Alta", variante: "perigo" },
    urgente: { rotulo: "Urgente", variante: "perigo" },
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)]">
        {/* Campo de Busca */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Filtros Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Coluna */}
          <select
            value={filtroColuna}
            onChange={(e) => setFiltroColuna(e.target.value)}
            className="h-8 px-2.5 text-xs rounded bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none cursor-pointer"
          >
            <option value="todas">Todas as Colunas</option>
            {quadro.colunas.map((col) => (
              <option key={col.id} value={col.id}>
                {col.titulo}
              </option>
            ))}
          </select>

          {/* Filtro Prioridade */}
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="h-8 px-2.5 text-xs rounded bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none cursor-pointer"
          >
            <option value="todas">Todas as Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
            <option value="nenhuma">Nenhuma</option>
          </select>
        </div>
      </div>

      {/* Tabela de Tarefas */}
      <div className="superficie-glass rounded-[var(--raio-lg)] border border-[var(--border)] overflow-hidden shadow-[var(--sombra-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-elevada)]/80 text-[var(--foreground-muted)] uppercase tracking-wider text-[11px] border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4 font-semibold">Tarefa</th>
                <th className="py-3 px-4 font-semibold">Status / Coluna</th>
                <th className="py-3 px-4 font-semibold">Prioridade</th>
                <th className="py-3 px-4 font-semibold">Vencimento</th>
                <th className="py-3 px-4 font-semibold">Checklist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {cartoesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--foreground-muted)]">
                    Nenhuma tarefa encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                cartoesFiltrados.map((cartao) => {
                  const itens = cartao.checklists?.flatMap((c) => c.itens) || [];
                  const totalItens = itens.length;
                  const concluidos = itens.filter((i) => i.concluido).length;
                  const prio = prioridadeVariante[cartao.prioridade];

                  return (
                    <tr
                      key={cartao.id}
                      onClick={() => setCartaoSelecionado(cartao)}
                      className="hover:bg-[var(--surface-elevada)]/60 cursor-pointer transition-colors"
                    >
                      {/* Título */}
                      <td className="py-3 px-4 font-medium text-[var(--foreground)] max-w-xs truncate">
                        {cartao.titulo}
                      </td>

                      {/* Coluna */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--surface-elevada)] border border-[var(--border)] text-[11px] text-[var(--foreground)]">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: cartao.corColuna || "#3b82f6" }}
                          />
                          {cartao.nomeColuna}
                        </span>
                      </td>

                      {/* Prioridade */}
                      <td className="py-3 px-4">
                        {prio ? (
                          <Badge variante={prio.variante} tamanho="sm">
                            {prio.rotulo}
                          </Badge>
                        ) : (
                          <span className="text-[var(--foreground-sutil)]">—</span>
                        )}
                      </td>

                      {/* Vencimento */}
                      <td className="py-3 px-4 text-[var(--foreground-muted)]">
                        {cartao.data_vencimento ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatarDataPtBr(cartao.data_vencimento)}
                          </span>
                        ) : (
                          <span className="text-[var(--foreground-sutil)]">—</span>
                        )}
                      </td>

                      {/* Checklist */}
                      <td className="py-3 px-4">
                        {totalItens > 0 ? (
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              concluidos === totalItens
                                ? "text-[var(--sucesso)]"
                                : "text-[var(--foreground-muted)]"
                            }`}
                          >
                            <CheckSquare className="h-3 w-3" />
                            <span>
                              {concluidos}/{totalItens}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[var(--foreground-sutil)]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes ao Clicar na Linha */}
      {cartaoSelecionado && (
        <DialogCartao
          cartao={cartaoSelecionado}
          colunas={quadro.colunas}
          aoFechar={() => setCartaoSelecionado(null)}
          aoAtualizar={aoAtualizar}
        />
      )}
    </div>
  );
}
