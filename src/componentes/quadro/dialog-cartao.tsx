"use client";

import * as React from "react";
import {
  X,
  Calendar,
  Flag,
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { CartaoCompleto, ColunaComCartoes } from "@/lib/acoes/projeto-acoes";
import {
  atualizarCartaoAcao,
  criarChecklistAcao,
  adicionarItemChecklistAcao,
  alternarItemChecklistAcao,
} from "@/lib/acoes/projeto-acoes";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";
import { Badge } from "@/componentes/ui/badge";
import { GerenciadorAnexos } from "@/componentes/compartilhado/gerenciador-anexos";
import { GerenciadorDependencias } from "@/componentes/compartilhado/gerenciador-dependencias";

interface PropriedadesDialogCartao {
  cartao: CartaoCompleto;
  colunas: ColunaComCartoes[];
  aoFechar: () => void;
  aoAtualizar: () => void;
}

export function DialogCartao({
  cartao,
  colunas,
  aoFechar,
  aoAtualizar,
}: PropriedadesDialogCartao) {
  const [titulo, setTitulo] = React.useState(cartao.titulo);
  const [descricao, setDescricao] = React.useState(cartao.descricao || "");
  const [prioridade, setPrioridade] = React.useState(cartao.prioridade);
  const [colunaId, setColunaId] = React.useState(cartao.coluna_id);
  const [dataVencimento, setDataVencimento] = React.useState(
    cartao.data_vencimento || ""
  );

  const [novoItemTexto, setNovoItemTexto] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);

  const aoSalvarCampos = async (dadosAtualizados: Partial<CartaoCompleto>) => {
    setSalvando(true);
    try {
      await atualizarCartaoAcao(cartao.id, dadosAtualizados);
      aoAtualizar();
    } finally {
      setSalvando(false);
    }
  };

  const aoAdicionarChecklist = async () => {
    await criarChecklistAcao(cartao.id, "Tarefas");
    aoAtualizar();
  };

  const aoAdicionarItem = async (checklistId: string) => {
    if (!novoItemTexto.trim()) return;
    await adicionarItemChecklistAcao(checklistId, novoItemTexto.trim());
    setNovoItemTexto("");
    aoAtualizar();
  };

  const aoAlternarItem = async (itemId: string, concluidoAtual: boolean) => {
    await alternarItemChecklistAcao(itemId, !concluidoAtual);
    aoAtualizar();
  };

  const checklistPrincipal = cartao.checklists?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="superficie-glass w-full max-w-2xl rounded-[var(--raio-lg)] border border-[var(--border)] shadow-[var(--sombra-lg)] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
              Cartão Kanban
            </span>
          </div>
          <button
            onClick={aoFechar}
            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-1 rounded hover:bg-[var(--surface-elevada)] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Título Editável */}
          <div>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onBlur={() => {
                if (titulo.trim() !== cartao.titulo) {
                  aoSalvarCampos({ titulo: titulo.trim() });
                }
              }}
              placeholder="Título da tarefa..."
              className="w-full text-lg md:text-xl font-bold bg-transparent text-[var(--foreground)] placeholder:text-[var(--foreground-sutil)] focus:outline-none border-b border-transparent focus:border-[var(--border)] pb-1 transition-colors"
            />
          </div>

          {/* Propriedades Rápidas: Coluna, Prioridade, Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-[var(--raio-md)] bg-[var(--surface-elevada)]/60 border border-[var(--border)]">
            {/* Coluna */}
            <div>
              <Rotulo className="text-[11px] mb-1">Coluna / Status</Rotulo>
              <select
                value={colunaId}
                onChange={(e) => {
                  setColunaId(e.target.value);
                  aoSalvarCampos({ coluna_id: e.target.value });
                }}
                className="w-full h-8 px-2 text-xs rounded bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] cursor-pointer"
              >
                {colunas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <Rotulo className="text-[11px] mb-1">Prioridade</Rotulo>
              <select
                value={prioridade}
                onChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const nova = e.target.value as any;
                  setPrioridade(nova);
                  aoSalvarCampos({ prioridade: nova });
                }}
                className="w-full h-8 px-2 text-xs rounded bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] cursor-pointer"
              >
                <option value="nenhuma">Nenhuma</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            {/* Vencimento */}
            <div>
              <Rotulo className="text-[11px] mb-1">Data de Vencimento</Rotulo>
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => {
                  setDataVencimento(e.target.value);
                  aoSalvarCampos({ data_vencimento: e.target.value || null });
                }}
                className="w-full h-8 px-2 text-xs rounded bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Rotulo className="mb-1.5">Descrição detalhada</Rotulo>
            <textarea
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onBlur={() => {
                if (descricao !== cartao.descricao) {
                  aoSalvarCampos({ descricao });
                }
              }}
              placeholder="Adicione detalhes, contexto ou links sobre esta tarefa..."
              className="w-full p-3 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] text-xs text-[var(--foreground)] border border-[var(--border)] placeholder:text-[var(--foreground-sutil)] focus:outline-none focus:border-[var(--accent)] resize-y leading-relaxed"
            />
          </div>

          {/* Checklist de Tarefas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-[var(--accent)]" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                  Checklist de Itens
                </h4>
              </div>

              {!checklistPrincipal && (
                <button
                  type="button"
                  onClick={aoAdicionarChecklist}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Adicionar Checklist</span>
                </button>
              )}
            </div>

            {checklistPrincipal && (
              <div className="space-y-2 p-3.5 rounded-[var(--raio-md)] bg-[var(--surface)] border border-[var(--border)]">
                {/* Itens existentes */}
                <div className="space-y-1.5">
                  {checklistPrincipal.itens.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => aoAlternarItem(item.id, item.concluido)}
                      className="flex items-center gap-2.5 p-1.5 rounded hover:bg-[var(--surface-elevada)] cursor-pointer text-xs group transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.concluido}
                        onChange={() => {}}
                        className="rounded border-[var(--border)] accent-[var(--accent)] cursor-pointer"
                      />
                      <span
                        className={`flex-1 ${
                          item.concluido
                            ? "line-through text-[var(--foreground-sutil)]"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {item.texto}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Adicionar novo item */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                  <Input
                    placeholder="Adicionar um item à lista..."
                    value={novoItemTexto}
                    onChange={(e) => setNovoItemTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        aoAdicionarItem(checklistPrincipal.id);
                      }
                    }}
                    className="h-8 text-xs"
                  />
                  <Botao
                    tamanho="sm"
                    onClick={() => aoAdicionarItem(checklistPrincipal.id)}
                  >
                    Adicionar
                  </Botao>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-white/5 my-4" />

          {/* Dependências e Bloqueios (Fase 5.2) */}
          <GerenciadorDependencias
            workspaceId={cartao.workspace_id}
            cartaoId={cartao.id}
            colunas={colunas}
          />

          <div className="h-px bg-white/5 my-4" />

          {/* Anexos e Mídias no Supabase Storage (Fase 5.1) */}
          <GerenciadorAnexos
            workspaceId={cartao.workspace_id}
            recursoTipo="cartao"
            recursoId={cartao.id}
          />
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground-muted)]">
          <span>{salvando ? "Salvando alterações..." : "Alterações salvas"}</span>
          <Botao tamanho="sm" onClick={aoFechar}>
            Concluir
          </Botao>
        </div>
      </div>
    </div>
  );
}
