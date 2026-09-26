"use client";

import * as React from "react";
import { Calendar, CheckSquare, Flag } from "lucide-react";
import type { CartaoCompleto } from "@/lib/acoes/projeto-acoes";
import { formatarDataPtBr } from "@/lib/utilitarios";
import { Badge } from "@/componentes/ui/badge";

interface PropriedadesCartaoKanban {
  cartao: CartaoCompleto;
  aoClicar: () => void;
}

export function CartaoKanban({ cartao, aoClicar }: PropriedadesCartaoKanban) {
  // Calcula progresso dos itens do checklist
  const itens = cartao.checklists?.flatMap((c) => c.itens) || [];
  const totalItens = itens.length;
  const concluidos = itens.filter((i) => i.concluido).length;

  const prioridadeVariante: Record<
    string,
    { rotulo: string; variante: "padrao" | "sucesso" | "aviso" | "perigo" | "info" | "secundario" }
  > = {
    baixa: { rotulo: "Baixa", variante: "info" },
    media: { rotulo: "Média", variante: "aviso" },
    alta: { rotulo: "Alta", variante: "perigo" },
    urgente: { rotulo: "Urgente", variante: "perigo" },
  };

  const prioridadeInfo = prioridadeVariante[cartao.prioridade];

  return (
    <div
      onClick={aoClicar}
      className="superficie-glass p-3 rounded-[var(--raio-md)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[var(--sombra-md)] transition-all cursor-pointer group text-left space-y-2.5 active:scale-[0.99]"
    >
      {/* Título do Cartão */}
      <h4 className="text-xs font-semibold text-[var(--foreground)] leading-snug group-hover:text-[var(--accent)] transition-colors">
        {cartao.titulo}
      </h4>

      {/* Descrição resumida se houver */}
      {cartao.descricao && (
        <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-2 leading-relaxed">
          {cartao.descricao}
        </p>
      )}

      {/* Metadados: Prioridade, Checklist, Vencimento */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border)]/50 text-[10px] text-[var(--foreground-muted)]">
        {prioridadeInfo && (
          <Badge variante={prioridadeInfo.variante} tamanho="sm">
            {prioridadeInfo.rotulo}
          </Badge>
        )}

        {totalItens > 0 && (
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
        )}

        {cartao.data_vencimento && (
          <span className="flex items-center gap-1 font-medium text-[var(--foreground-sutil)]">
            <Calendar className="h-3 w-3" />
            <span>{formatarDataPtBr(cartao.data_vencimento)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
