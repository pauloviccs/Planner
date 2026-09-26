"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, X } from "lucide-react";
import type { ColunaComCartoes, CartaoCompleto } from "@/lib/acoes/projeto-acoes";
import { criarCartaoAcao } from "@/lib/acoes/projeto-acoes";
import { CartaoArrastavel } from "./cartao-arrastavel";
import { Botao } from "@/componentes/ui/botao";

interface PropriedadesColunaDroppable {
  coluna: ColunaComCartoes;
  todasColunas: ColunaComCartoes[];
  workspaceId: string;
  aoSelecionarCartao: (cartao: CartaoCompleto) => void;
  aoMoverCartao: (cartaoId: string, novaColunaId: string) => void;
  aoAtualizar: () => void;
}

export function ColunaDroppable({
  coluna,
  todasColunas,
  workspaceId,
  aoSelecionarCartao,
  aoMoverCartao,
  aoAtualizar,
}: PropriedadesColunaDroppable) {
  const [criando, setCriando] = React.useState(false);
  const [novoTitulo, setNovoTitulo] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: coluna.id,
    data: {
      tipo: "coluna",
      coluna,
    },
  });

  const idsCartoes = React.useMemo(() => coluna.cartoes.map((c) => c.id), [coluna.cartoes]);

  const aoAdicionarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    setSalvando(true);
    try {
      await criarCartaoAcao(coluna.id, workspaceId, {
        titulo: novoTitulo.trim(),
      });
      setNovoTitulo("");
      setCriando(false);
      aoAtualizar();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 flex flex-col rounded-[var(--raio-lg)] border max-h-[calc(100vh-210px)] overflow-hidden transition-colors ${
        isOver
          ? "bg-[var(--surface-elevada)] border-[var(--accent)] shadow-[var(--sombra-md)] ring-1 ring-[var(--accent)]/50"
          : "bg-[var(--surface-elevada)]/40 border-[var(--border)]"
      }`}
    >
      {/* Cabeçalho da Coluna */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]/60">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: coluna.cor || "#3b82f6" }}
            suppressHydrationWarning
          />
          <h3 className="text-xs font-semibold text-[var(--foreground)] truncate">
            {coluna.titulo}
          </h3>
          <span className="text-[11px] font-medium text-[var(--foreground-sutil)] px-1.5 py-0.2 rounded-full bg-[var(--surface)]">
            {coluna.cartoes.length}
          </span>
        </div>

        <button
          onClick={() => setCriando(true)}
          className="p-1 rounded text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
          title="Adicionar cartão"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Lista de Cartões com SortableContext */}
      <SortableContext items={idsCartoes} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[120px]">
          {coluna.cartoes.map((cartao) => (
            <CartaoArrastavel
              key={cartao.id}
              cartao={cartao}
              colunas={todasColunas}
              aoClicar={() => aoSelecionarCartao(cartao)}
              aoMoverParaColuna={(novaColId) => aoMoverCartao(cartao.id, novaColId)}
            />
          ))}

          {/* Formulário Inline de Criação de Cartão */}
          {criando ? (
            <form onSubmit={aoAdicionarCartao} className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] space-y-2">
              <input
                type="text"
                autoFocus
                placeholder="O que precisa ser feito?"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                className="w-full text-xs bg-transparent text-[var(--foreground)] placeholder:text-[var(--foreground-sutil)] focus:outline-none"
              />
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCriando(false);
                    setNovoTitulo("");
                  }}
                  className="p-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <Botao tamanho="sm" type="submit" carregando={salvando}>
                  Adicionar
                </Botao>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setCriando(true)}
              className="flex w-full items-center gap-1.5 p-2 rounded text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]/70 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Adicionar cartão</span>
            </button>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
