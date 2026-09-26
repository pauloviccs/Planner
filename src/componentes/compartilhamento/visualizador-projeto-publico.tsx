"use client";

import * as React from "react";
import { LayoutGrid, Table, Calendar, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/componentes/ui/badge";

interface CartaoPublico {
  id: string;
  coluna_id: string;
  titulo: string;
  descricao: string | null;
  prioridade: "nenhuma" | "baixa" | "media" | "alta" | "urgente";
  status: string;
  data_inicio: string | null;
  data_vencimento: string | null;
  posicao: number;
}

interface ColunaPublica {
  id: string;
  titulo: string;
  cor: string;
  posicao: number;
  cartoes: CartaoPublico[];
}

interface PropriedadesVisualizadorProjetoPublico {
  projeto: {
    id: string;
    nome: string;
    descricao: string | null;
    cor: string;
  };
  colunas: ColunaPublica[];
}

export function VisualizadorProjetoPublico({
  projeto,
  colunas,
}: PropriedadesVisualizadorProjetoPublico) {
  const [visao, setVisao] = React.useState<"kanban" | "tabela">("kanban");
  const [cartaoSelecionado, setCartaoSelecionado] = React.useState<CartaoPublico | null>(null);

  const obterBadgePrioridade = (prioridade: CartaoPublico["prioridade"]) => {
    switch (prioridade) {
      case "urgente":
        return <Badge variante="perigo">Urgente</Badge>;
      case "alta":
        return <Badge variante="aviso">Alta</Badge>;
      case "media":
        return <Badge variante="info">Média</Badge>;
      case "baixa":
        return <Badge variante="padrao">Baixa</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Seletor de Visões */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)] w-fit">
          <button
            onClick={() => setVisao("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              visao === "kanban"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Quadro Kanban</span>
          </button>

          <button
            onClick={() => setVisao("tabela")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              visao === "tabela"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Tabela</span>
          </button>
        </div>

        <span className="text-xs text-[var(--foreground-muted)]">
          Modo somente leitura
        </span>
      </div>

      {/* Visão Kanban */}
      {visao === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {colunas.map((coluna) => (
            <div
              key={coluna.id}
              className="w-72 shrink-0 flex flex-col rounded-[var(--raio-md)] bg-[var(--surface-elevada)]/70 border border-[var(--border)] max-h-[calc(100vh-220px)] overflow-hidden shadow-xs"
            >
              {/* Topo da Coluna */}
              <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: coluna.cor }}
                  />
                  <h3 className="font-semibold text-xs text-[var(--foreground)]">
                    {coluna.titulo}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[var(--foreground-muted)] px-1.5 py-0.2 rounded bg-[var(--surface)] border border-[var(--border)]">
                  {coluna.cartoes.length}
                </span>
              </div>

              {/* Lista de Cartões */}
              <div className="p-2 space-y-2 overflow-y-auto flex-1">
                {coluna.cartoes.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[var(--foreground-muted)]">
                    Nenhum item nesta coluna.
                  </div>
                ) : (
                  coluna.cartoes.map((cartao) => (
                    <div
                      key={cartao.id}
                      onClick={() => setCartaoSelecionado(cartao)}
                      className="superficie-glass p-3 rounded-[var(--raio-sm)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all cursor-pointer shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-medium text-[var(--foreground)] leading-snug">
                          {cartao.titulo}
                        </h4>
                        {obterBadgePrioridade(cartao.prioridade)}
                      </div>

                      {cartao.descricao && (
                        <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-2">
                          {cartao.descricao}
                        </p>
                      )}

                      {cartao.data_vencimento && (
                        <div className="flex items-center gap-1 text-[10px] text-[var(--foreground-muted)] font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{cartao.data_vencimento}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visão Tabela */}
      {visao === "tabela" && (
        <div className="superficie-glass rounded-[var(--raio-md)] border border-[var(--border)] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-elevada)] border-b border-[var(--border)] text-[var(--foreground-muted)] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Coluna</th>
                <th className="p-3">Prioridade</th>
                <th className="p-3">Vencimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {colunas.flatMap((col) =>
                col.cartoes.map((cartao) => (
                  <tr
                    key={cartao.id}
                    onClick={() => setCartaoSelecionado(cartao)}
                    className="hover:bg-[var(--surface-elevada)]/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-medium text-[var(--foreground)]">
                      {cartao.titulo}
                    </td>
                    <td className="p-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px]"
                        style={{
                          backgroundColor: `${col.cor}15`,
                          color: col.cor,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: col.cor }}
                        />
                        {col.titulo}
                      </span>
                    </td>
                    <td className="p-3">{obterBadgePrioridade(cartao.prioridade)}</td>
                    <td className="p-3 text-[var(--foreground-muted)] font-mono text-[11px]">
                      {cartao.data_vencimento || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Simples de Leitura do Cartão */}
      {cartaoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="superficie-glass w-full max-w-lg rounded-[var(--raio-lg)] border border-[var(--border)] p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {cartaoSelecionado.titulo}
              </h3>
              {obterBadgePrioridade(cartaoSelecionado.prioridade)}
            </div>

            {cartaoSelecionado.descricao ? (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                  Descrição
                </span>
                <p className="text-xs text-[var(--foreground)] leading-relaxed whitespace-pre-line p-3 rounded-[var(--raio-sm)] bg-[var(--surface-elevada)] border border-[var(--border)]">
                  {cartaoSelecionado.descricao}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--foreground-muted)] italic">
                Nenhuma descrição detalhada informada.
              </p>
            )}

            {cartaoSelecionado.data_vencimento && (
              <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>
                  Data de vencimento:{" "}
                  <strong className="text-[var(--foreground)] font-mono">
                    {cartaoSelecionado.data_vencimento}
                  </strong>
                </span>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[var(--border)]">
              <button
                onClick={() => setCartaoSelecionado(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-[var(--raio-sm)] bg-[var(--surface-elevada)] hover:bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
