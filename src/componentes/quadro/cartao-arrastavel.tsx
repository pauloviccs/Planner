"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, CheckSquare, MoreVertical, ArrowRightLeft } from "lucide-react";
import type { CartaoCompleto, ColunaComCartoes } from "@/lib/acoes/projeto-acoes";
import { formatarDataPtBr } from "@/lib/utilitarios";
import { Badge } from "@/componentes/ui/badge";

interface PropriedadesCartaoArrastavel {
  cartao: CartaoCompleto;
  colunas: ColunaComCartoes[];
  aoClicar: () => void;
  aoMoverParaColuna: (novaColunaId: string) => void;
}

export function CartaoArrastavel({
  cartao,
  colunas,
  aoClicar,
  aoMoverParaColuna,
}: PropriedadesCartaoArrastavel) {
  const [menuMoverAberto, setMenuMoverAberto] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cartao.id,
    data: {
      tipo: "cartao",
      cartao,
    },
  });

  const estilo: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  React.useEffect(() => {
    function tratarCliqueFora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuMoverAberto(false);
      }
    }
    if (menuMoverAberto) {
      document.addEventListener("mousedown", tratarCliqueFora);
    }
    return () => {
      document.removeEventListener("mousedown", tratarCliqueFora);
    };
  }, [menuMoverAberto]);

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
      ref={setNodeRef}
      style={estilo}
      {...attributes}
      {...listeners}
      onClick={aoClicar}
      className="superficie-glass relative p-3 rounded-[var(--raio-md)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[var(--sombra-md)] transition-all cursor-grab active:cursor-grabbing group text-left space-y-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        {/* Título do Cartão */}
        <h4 className="text-xs font-semibold text-[var(--foreground)] leading-snug group-hover:text-[var(--accent)] transition-colors flex-1">
          {cartao.titulo}
        </h4>

        {/* Menu acessível para mover de coluna sem mouse */}
        <div
          ref={menuRef}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setMenuMoverAberto(!menuMoverAberto)}
            className="p-0.5 rounded text-[var(--foreground-sutil)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            title="Mover para coluna (Acessibilidade)"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>

          {menuMoverAberto && (
            <div className="superficie-glass absolute right-0 mt-1 w-44 rounded-[var(--raio-md)] p-1 shadow-[var(--sombra-lg)] z-40 border border-[var(--border)] text-xs animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase text-[var(--foreground-sutil)] border-b border-[var(--border)] mb-1">
                Mover para:
              </div>
              {colunas.map((col) => (
                <button
                  key={col.id}
                  disabled={col.id === cartao.coluna_id}
                  onClick={() => {
                    aoMoverParaColuna(col.id);
                    setMenuMoverAberto(false);
                  }}
                  className="flex w-full items-center gap-1.5 px-2 py-1 rounded text-left hover:bg-[var(--surface-elevada)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ArrowRightLeft className="h-3 w-3 text-[var(--foreground-muted)]" />
                  <span className="truncate">{col.titulo}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Descrição resumida se houver */}
      {cartao.descricao && (
        <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-2 leading-relaxed pointer-events-none">
          {cartao.descricao}
        </p>
      )}

      {/* Metadados: Prioridade, Checklist, Vencimento */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border)]/50 text-[10px] text-[var(--foreground-muted)] pointer-events-none">
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
