"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { QuadroDetalhe, CartaoCompleto } from "@/lib/acoes/projeto-acoes";
import { DialogCartao } from "./dialog-cartao";

interface PropriedadesCalendarioKanban {
  quadro: QuadroDetalhe;
  aoAtualizar: () => void;
}

export function CalendarioKanban({
  quadro,
  aoAtualizar,
}: PropriedadesCalendarioKanban) {
  const [mesAtual, setMesAtual] = React.useState(new Date());
  const [cartaoSelecionado, setCartaoSelecionado] = React.useState<CartaoCompleto | null>(null);

  // Consolida todos os cartões que possuem data_vencimento
  const todosCartoes = React.useMemo(() => {
    return quadro.colunas.flatMap((col) =>
      col.cartoes.map((c) => ({
        ...c,
        nomeColuna: col.titulo,
        corColuna: col.cor,
      }))
    );
  }, [quadro.colunas]);

  // Gera dias do grid do calendário
  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(inicioMes);
  const inicioGrid = startOfWeek(inicioMes, { weekStartsOn: 0 });
  const fimGrid = endOfWeek(fimMes, { weekStartsOn: 0 });

  const diasDoGrid = eachDayOfInterval({
    start: inicioGrid,
    end: fimGrid,
  });

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-4">
      {/* Navegação de Mês */}
      <div className="flex items-center justify-between p-3 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold capitalize text-[var(--foreground)]">
            {format(mesAtual, "MMMM yyyy", { locale: ptBR })}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMesAtual(subMonths(mesAtual, 1))}
            className="p-1.5 rounded hover:bg-[var(--surface)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            title="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMesAtual(new Date())}
            className="px-2.5 py-1 text-xs rounded hover:bg-[var(--surface)] text-[var(--foreground)] transition-colors font-medium cursor-pointer"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setMesAtual(addMonths(mesAtual, 1))}
            className="p-1.5 rounded hover:bg-[var(--surface)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            title="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid Calendário */}
      <div className="superficie-glass rounded-[var(--raio-lg)] border border-[var(--border)] overflow-hidden shadow-[var(--sombra-sm)]">
        {/* Cabeçalho dos Dias da Semana */}
        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--surface-elevada)]/80 text-center text-[11px] font-semibold text-[var(--foreground-muted)] uppercase py-2">
          {diasSemana.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Células de Dias */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border)]">
          {diasDoGrid.map((dia) => {
            const ehMesmoMes = isSameMonth(dia, mesAtual);
            const ehHoje = isSameDay(dia, new Date());
            const dataString = format(dia, "yyyy-MM-dd");

            // Busca cartões que vencem neste dia
            const cartoesNoDia = todosCartoes.filter(
              (c) => c.data_vencimento === dataString
            );

            return (
              <div
                key={dia.toISOString()}
                className={`min-h-[100px] p-1.5 flex flex-col justify-start transition-colors ${
                  !ehMesmoMes
                    ? "bg-[var(--surface-elevada)]/20 opacity-40"
                    : "hover:bg-[var(--surface-elevada)]/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      ehHoje
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--foreground-muted)]"
                    }`}
                  >
                    {format(dia, "d")}
                  </span>
                  {cartoesNoDia.length > 0 && (
                    <span className="text-[10px] text-[var(--foreground-sutil)] font-mono">
                      {cartoesNoDia.length}
                    </span>
                  )}
                </div>

                {/* Lista de Cartões no Dia */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                  {cartoesNoDia.map((cartao) => (
                    <div
                      key={cartao.id}
                      onClick={() => setCartaoSelecionado(cartao)}
                      className="p-1 rounded bg-[var(--surface-elevada)] border border-[var(--border)] hover:border-[var(--accent)] cursor-pointer text-[10px] font-medium text-[var(--foreground)] truncate shadow-2xs group"
                    >
                      <span className="truncate block group-hover:text-[var(--accent)]">
                        {cartao.titulo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalhes do Cartão */}
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
