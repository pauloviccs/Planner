"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isWeekend,
  addMonths,
  subMonths,
  isWithinInterval,
  parseISO,
  differenceInCalendarDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { QuadroDetalhe, CartaoCompleto } from "@/lib/acoes/projeto-acoes";
import { DialogCartao } from "../quadro/dialog-cartao";

interface PropriedadesTimelineKanban {
  quadro: QuadroDetalhe;
  aoAtualizar: () => void;
}

export function TimelineKanban({
  quadro,
  aoAtualizar,
}: PropriedadesTimelineKanban) {
  const [mesAtual, setMesAtual] = React.useState(new Date());
  const [cartaoSelecionado, setCartaoSelecionado] = React.useState<CartaoCompleto | null>(null);
  const [busca, setBusca] = React.useState("");
  const [filtroColuna, setFiltroColuna] = React.useState<string>("todas");
  const [filtroPrioridade, setFiltroPrioridade] = React.useState<string>("todas");

  // Intervalo do mês selecionado
  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(mesAtual);
  const diasDoMes = eachDayOfInterval({ start: inicioMes, end: fimMes });
  const totalDias = diasDoMes.length;

  // Lista todos os cartões com suas respectivas colunas
  const todosCartoes = React.useMemo(() => {
    return quadro.colunas.flatMap((col) =>
      col.cartoes.map((cartao) => ({
        ...cartao,
        nomeColuna: col.titulo,
        corColuna: col.cor,
      }))
    );
  }, [quadro.colunas]);

  // Filtra cartões
  const cartoesFiltrados = React.useMemo(() => {
    return todosCartoes.filter((c) => {
      const matchBusca =
        !busca ||
        c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        (c.descricao && c.descricao.toLowerCase().includes(busca.toLowerCase()));

      const matchColuna =
        filtroColuna === "todas" || c.coluna_id === filtroColuna;

      const matchPrioridade =
        filtroPrioridade === "todas" || c.prioridade === filtroPrioridade;

      return matchBusca && matchColuna && matchPrioridade;
    });
  }, [todosCartoes, busca, filtroColuna, filtroPrioridade]);

  // Navegação
  const proximoMes = () => setMesAtual(addMonths(mesAtual, 1));
  const mesAnterior = () => setMesAtual(subMonths(mesAtual, 1));
  const hoje = () => setMesAtual(new Date());

  // Calcula posição e largura da barra no grid do mês
  const calcularPosicaoBarra = (cartao: (typeof todosCartoes)[0]) => {
    let dataInicio = cartao.data_inicio
      ? parseISO(cartao.data_inicio)
      : cartao.data_vencimento
      ? parseISO(cartao.data_vencimento)
      : null;

    let dataFim = cartao.data_vencimento
      ? parseISO(cartao.data_vencimento)
      : cartao.data_inicio
      ? parseISO(cartao.data_inicio)
      : null;

    // Se não tiver data alguma, simula 2 dias a partir da criação
    if (!dataInicio && !dataFim) {
      const criado = parseISO(cartao.criado_em);
      dataInicio = criado;
      dataFim = new Date(criado.getTime() + 2 * 24 * 60 * 60 * 1000);
    } else if (dataInicio && !dataFim) {
      dataFim = dataInicio;
    } else if (!dataInicio && dataFim) {
      dataInicio = dataFim;
    }

    // Se dataInicio > dataFim, normaliza
    if (dataInicio && dataFim && dataInicio > dataFim) {
      const temp = dataInicio;
      dataInicio = dataFim;
      dataFim = temp;
    }

    if (!dataInicio || !dataFim) return null;

    // Verifica se a barra intercepta o mês atual
    const inicioTimestamp = startOfDay(dataInicio).getTime();
    const fimTimestamp = endOfDay(dataFim).getTime();
    const mesInicioTimestamp = inicioMes.getTime();
    const mesFimTimestamp = fimMes.getTime();

    if (fimTimestamp < mesInicioTimestamp || inicioTimestamp > mesFimTimestamp) {
      return null; // Fora do mês visível
    }

    // Calcula dia inicial (1 a totalDias) limitado ao mês
    const diaInicioLimitado =
      inicioTimestamp < mesInicioTimestamp
        ? 1
        : differenceInCalendarDays(dataInicio, inicioMes) + 1;

    // Calcula dia final (1 a totalDias) limitado ao mês
    const diaFimLimitado =
      fimTimestamp > mesFimTimestamp
        ? totalDias
        : differenceInCalendarDays(dataFim, inicioMes) + 1;

    const duracaoDias = Math.max(1, diaFimLimitado - diaInicioLimitado + 1);

    // Porcentagem de Checklist
    const totalItens = cartao.checklists?.reduce(
      (acc, cl) => acc + cl.itens.length,
      0
    ) || 0;
    const itensConcluidos = cartao.checklists?.reduce(
      (acc, cl) => acc + cl.itens.filter((i) => i.concluido).length,
      0
    ) || 0;
    const progressoPercent =
      totalItens > 0 ? Math.round((itensConcluidos / totalItens) * 100) : 0;

    return {
      diaInicio: diaInicioLimitado,
      duracao: duracaoDias,
      colStart: diaInicioLimitado,
      colSpan: duracaoDias,
      dataInicioFormatada: format(dataInicio, "dd/MM", { locale: ptBR }),
      dataFimFormatada: format(dataFim, "dd/MM", { locale: ptBR }),
      progressoPercent,
      totalItens,
      itensConcluidos,
      semDataDefinida: !cartao.data_inicio && !cartao.data_vencimento,
    };
  };

  return (
    <div className="space-y-4">
      {/* Barra de Controles e Filtros da Linha do Tempo */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)]">
        {/* Navegação de Mês */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-[var(--raio-sm)] p-0.5">
            <button
              onClick={mesAnterior}
              className="p-1.5 rounded hover:bg-[var(--surface-elevada)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={hoje}
              className="px-2.5 py-1 text-xs font-semibold hover:bg-[var(--surface-elevada)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={proximoMes}
              className="p-1.5 rounded hover:bg-[var(--surface-elevada)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)] capitalize pl-1">
            <CalendarIcon className="h-4 w-4 text-[var(--accent)]" />
            <span>{format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR })}</span>
          </div>
        </div>

        {/* Busca e Filtros Rápidos */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Filtrar tarefas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[var(--raio-sm)] bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <select
            value={filtroColuna}
            onChange={(e) => setFiltroColuna(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-[var(--raio-sm)] bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="todas">Todas as Colunas</option>
            {quadro.colunas.map((col) => (
              <option key={col.id} value={col.id}>
                {col.titulo}
              </option>
            ))}
          </select>

          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-[var(--raio-sm)] bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
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

      {/* Grid da Linha do Tempo (Gantt) */}
      <div className="superficie-glass rounded-[var(--raio-md)] border border-[var(--border)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <div
            className="min-w-[900px]"
            style={{
              display: "grid",
              gridTemplateColumns: `240px repeat(${totalDias}, minmax(36px, 1fr))`,
            }}
          >
            {/* Cabeçalho da Coluna de Tarefas */}
            <div className="sticky left-0 z-20 bg-[var(--surface-elevada)] border-b border-r border-[var(--border)] p-3 text-xs font-semibold text-[var(--foreground)] flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>Tarefa / Atividade</span>
              </span>
              <span className="text-[10px] text-[var(--foreground-muted)] px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">
                {cartoesFiltrados.length}
              </span>
            </div>

            {/* Cabeçalho dos Dias do Mês */}
            {diasDoMes.map((dia) => {
              const hojeDia = isToday(dia);
              const fimDeSemana = isWeekend(dia);

              return (
                <div
                  key={dia.toISOString()}
                  className={`p-1.5 text-center border-b border-r border-[var(--border)] flex flex-col items-center justify-center transition-colors ${
                    hojeDia
                      ? "bg-[var(--accent)]/15 border-b-[var(--accent)] font-bold"
                      : fimDeSemana
                      ? "bg-[var(--surface-elevada)]/60 text-[var(--foreground-muted)]"
                      : "bg-[var(--surface-elevada)] text-[var(--foreground)]"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
                    {format(dia, "EEE", { locale: ptBR })}
                  </span>
                  <span
                    className={`text-xs mt-0.5 inline-flex items-center justify-center h-5 w-5 rounded-full ${
                      hojeDia
                        ? "bg-[var(--accent)] text-white font-bold shadow-xs"
                        : ""
                    }`}
                  >
                    {format(dia, "d")}
                  </span>
                </div>
              );
            })}

            {/* Linhas de Cartões */}
            {cartoesFiltrados.length === 0 ? (
              <div
                className="col-span-full p-8 text-center text-xs text-[var(--foreground-muted)]"
              >
                Nenhuma tarefa encontrada para os filtros selecionados.
              </div>
            ) : (
              cartoesFiltrados.map((cartao) => {
                const pos = calcularPosicaoBarra(cartao);

                return (
                  <React.Fragment key={cartao.id}>
                    {/* Coluna Esquerda Fixa com Detalhe da Tarefa */}
                    <div
                      onClick={() => setCartaoSelecionado(cartao)}
                      className="sticky left-0 z-10 bg-[var(--surface)] hover:bg-[var(--surface-elevada)] border-b border-r border-[var(--border)] p-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors group shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: cartao.corColuna }}
                        />
                        <span className="text-xs font-medium text-[var(--foreground)] truncate group-hover:text-[var(--accent)]">
                          {cartao.titulo}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--foreground-muted)] shrink-0 px-1.5 py-0.5 rounded bg-[var(--surface-elevada)] border border-[var(--border)]">
                        {cartao.nomeColuna}
                      </span>
                    </div>

                    {/* Espaço da Linha do Tempo com a Barra Horizontal */}
                    <div
                      className="relative border-b border-[var(--border)] py-1.5"
                      style={{
                        gridColumn: `2 / span ${totalDias}`,
                        display: "grid",
                        gridTemplateColumns: `repeat(${totalDias}, 1fr)`,
                      }}
                    >
                      {/* Linhas de fundo verticais */}
                      {diasDoMes.map((dia, idx) => (
                        <div
                          key={`bg-${dia.toISOString()}`}
                          className={`h-full border-r border-[var(--border)]/40 pointer-events-none ${
                            isToday(dia)
                              ? "bg-[var(--accent)]/5"
                              : isWeekend(dia)
                              ? "bg-[var(--surface-elevada)]/20"
                              : ""
                          }`}
                          style={{ gridColumn: idx + 1 }}
                        />
                      ))}

                      {/* Barra do Cartão no Gantt */}
                      {pos && (
                        <div
                          onClick={() => setCartaoSelecionado(cartao)}
                          className="absolute top-2 bottom-2 z-10 rounded-[var(--raio-sm)] flex items-center px-2.5 text-xs text-white font-medium cursor-pointer shadow-sm hover:brightness-110 hover:shadow-md transition-all group overflow-hidden border border-white/20"
                          style={{
                            gridColumnStart: pos.colStart,
                            gridColumnEnd: `span ${pos.colSpan}`,
                            left: "2px",
                            right: "2px",
                            backgroundColor: cartao.corColuna || "var(--accent)",
                          }}
                          title={`${cartao.titulo} (${pos.dataInicioFormatada} até ${pos.dataFimFormatada})`}
                        >
                          {/* Barra de Progresso Interna (Checklist) */}
                          {pos.progressoPercent > 0 && (
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-white/20 pointer-events-none"
                              style={{ width: `${pos.progressoPercent}%` }}
                            />
                          )}

                          {/* Conteúdo Visível da Barra */}
                          <div className="relative z-10 flex items-center justify-between w-full gap-2 truncate">
                            <span className="truncate text-[11px] drop-shadow-xs">
                              {cartao.titulo}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0 text-[10px] opacity-90">
                              {pos.semDataDefinida ? (
                                <span className="flex items-center gap-0.5 text-[9px] bg-black/30 px-1 rounded">
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  <span>Sem prazo</span>
                                </span>
                              ) : (
                                <span>
                                  {pos.dataInicioFormatada} - {pos.dataFimFormatada}
                                </span>
                              )}

                              {pos.totalItens > 0 && (
                                <span className="flex items-center gap-0.5 bg-black/30 px-1 py-0.2 rounded font-mono">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  <span>{pos.progressoPercent}%</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialog para Visualização e Edição do Cartão */}
      {cartaoSelecionado && (
        <DialogCartao
          cartao={cartaoSelecionado}
          colunas={quadro.colunas}
          aoAtualizar={aoAtualizar}
          aoFechar={() => {
            setCartaoSelecionado(null);
            aoAtualizar();
          }}
        />
      )}
    </div>
  );
}
