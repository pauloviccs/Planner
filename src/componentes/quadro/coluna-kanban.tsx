"use client";

import * as React from "react";
import { Plus, X, MoreHorizontal } from "lucide-react";
import type { ColunaComCartoes, CartaoCompleto } from "@/lib/acoes/projeto-acoes";
import { criarCartaoAcao } from "@/lib/acoes/projeto-acoes";
import { CartaoKanban } from "./cartao-kanban";
import { Botao } from "@/componentes/ui/botao";

interface PropriedadesColunaKanban {
  coluna: ColunaComCartoes;
  workspaceId: string;
  aoSelecionarCartao: (cartao: CartaoCompleto) => void;
  aoAtualizar: () => void;
}

export function ColunaKanban({
  coluna,
  workspaceId,
  aoSelecionarCartao,
  aoAtualizar,
}: PropriedadesColunaKanban) {
  const [criando, setCriando] = React.useState(false);
  const [novoTitulo, setNovoTitulo] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);

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
    <div className="w-72 shrink-0 flex flex-col rounded-[var(--raio-lg)] bg-[var(--surface-elevada)]/40 border border-[var(--border)] max-h-[calc(100vh-210px)] overflow-hidden">
      {/* Cabeçalho da Coluna */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]/60">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: coluna.cor || "#3b82f6" }}
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

      {/* Lista de Cartões com scroll vertical */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]">
        {coluna.cartoes.map((cartao) => (
          <CartaoKanban
            key={cartao.id}
            cartao={cartao}
            aoClicar={() => aoSelecionarCartao(cartao)}
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
    </div>
  );
}
