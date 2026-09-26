"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus, X, Calendar, CheckSquare } from "lucide-react";
import type { QuadroDetalhe, CartaoCompleto, ColunaComCartoes } from "@/lib/acoes/projeto-acoes";
import { criarColunaAcao, atualizarCartaoAcao } from "@/lib/acoes/projeto-acoes";
import { ColunaDroppable } from "./coluna-droppable";
import { DialogCartao } from "./dialog-cartao";
import { Botao } from "@/componentes/ui/botao";
import { Badge } from "@/componentes/ui/badge";
import { usarRealtime } from "@/lib/hooks/usar-realtime";

interface PropriedadesQuadroKanban {
  quadro: QuadroDetalhe;
  workspaceId: string;
}

export function QuadroKanban({ quadro, workspaceId }: PropriedadesQuadroKanban) {
  const router = useRouter();
  const [colunas, setColunas] = React.useState<ColunaComCartoes[]>(quadro.colunas);
  const [cartaoAtivo, setCartaoAtivo] = React.useState<CartaoCompleto | null>(null);
  const [cartaoSelecionado, setCartaoSelecionado] = React.useState<CartaoCompleto | null>(null);

  const [criandoColuna, setCriandoColuna] = React.useState(false);
  const [novoTituloColuna, setNovoTituloColuna] = React.useState("");
  const [salvandoColuna, setSalvandoColuna] = React.useState(false);

  // Sincroniza estado com as props quando o servidor revalidar
  React.useEffect(() => {
    setColunas(quadro.colunas);
  }, [quadro.colunas]);

  // Sincronização em tempo real via WebSockets (Supabase Realtime)
  usarRealtime({
    tabela: "cartoes",
    filtro: `workspace_id=eq.${workspaceId}`,
    aoMudar: () => {
      router.refresh();
    },
  });

  usarRealtime({
    tabela: "colunas",
    filtro: `quadro_id=eq.${quadro.id}`,
    aoMudar: () => {
      router.refresh();
    },
  });


  // Configuração dos sensores do DndKit (tolerância de 5px para não disparar no clique comum)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const aoAtualizar = () => {
    router.refresh();
  };

  // Encontra a coluna à qual um ID de cartão pertence
  const encontrarColunaDoCartao = (cartaoId: string) => {
    return colunas.find((col) => col.cartoes.some((c) => c.id === cartaoId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const cartao = active.data.current?.cartao as CartaoCompleto;
    if (cartao) {
      setCartaoAtivo(cartao);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const idAtivo = String(active.id);
    const idSobre = String(over.id);

    // Se estiver sobre o próprio cartão, ignora
    if (idAtivo === idSobre) return;

    const colunaOrigem = encontrarColunaDoCartao(idAtivo);
    let colunaDestino = colunas.find((c) => c.id === idSobre);

    if (!colunaDestino) {
      colunaDestino = encontrarColunaDoCartao(idSobre);
    }

    if (!colunaOrigem || !colunaDestino || colunaOrigem.id === colunaDestino.id) {
      return;
    }

    // Move otimisticamente entre colunas durante o arrasto
    setColunas((prev) => {
      const cartaoParaMover = colunaOrigem.cartoes.find((c) => c.id === idAtivo);
      if (!cartaoParaMover) return prev;

      return prev.map((col) => {
        if (col.id === colunaOrigem.id) {
          return {
            ...col,
            cartoes: col.cartoes.filter((c) => c.id !== idAtivo),
          };
        }
        if (col.id === colunaDestino.id) {
          return {
            ...col,
            cartoes: [...col.cartoes, { ...cartaoParaMover, coluna_id: colunaDestino.id }],
          };
        }
        return col;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setCartaoAtivo(null);

    if (!over) return;

    const idAtivo = String(active.id);
    const idSobre = String(over.id);

    // Identifica coluna de destino
    let colunaDestino = colunas.find((c) => c.id === idSobre);
    if (!colunaDestino) {
      colunaDestino = encontrarColunaDoCartao(idSobre);
    }

    if (!colunaDestino) return;

    // Persiste a nova coluna no Supabase
    await atualizarCartaoAcao(idAtivo, {
      coluna_id: colunaDestino.id,
    });
    aoAtualizar();
  };

  // Mover cartão via menu (acessibilidade por clique/teclado)
  const aoMoverCartao = async (cartaoId: string, novaColunaId: string) => {
    setColunas((prev) => {
      let cartao: CartaoCompleto | undefined;
      const novasColunas = prev.map((col) => {
        const achou = col.cartoes.find((c) => c.id === cartaoId);
        if (achou) cartao = achou;
        return {
          ...col,
          cartoes: col.cartoes.filter((c) => c.id !== cartaoId),
        };
      });

      if (!cartao) return prev;

      return novasColunas.map((col) => {
        if (col.id === novaColunaId) {
          return {
            ...col,
            cartoes: [...col.cartoes, { ...cartao!, coluna_id: novaColunaId }],
          };
        }
        return col;
      });
    });

    await atualizarCartaoAcao(cartaoId, { coluna_id: novaColunaId });
    aoAtualizar();
  };

  const aoCriarColuna = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTituloColuna.trim()) return;

    setSalvandoColuna(true);
    try {
      await criarColunaAcao(quadro.id, novoTituloColuna.trim());
      setNovoTituloColuna("");
      setCriandoColuna(false);
      aoAtualizar();
    } finally {
      setSalvandoColuna(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="relative flex-1 overflow-x-auto pb-6">
        <div className="flex items-start gap-4 min-w-max">
          {/* Colunas Droppable */}
          {colunas.map((coluna) => (
            <ColunaDroppable
              key={coluna.id}
              coluna={coluna}
              todasColunas={colunas}
              workspaceId={workspaceId}
              aoSelecionarCartao={(cartao) => setCartaoSelecionado(cartao)}
              aoMoverCartao={aoMoverCartao}
              aoAtualizar={aoAtualizar}
            />
          ))}

          {/* Botão / Formulário para Adicionar Nova Coluna */}
          {criandoColuna ? (
            <form
              onSubmit={aoCriarColuna}
              className="w-72 shrink-0 p-3 rounded-[var(--raio-lg)] bg-[var(--surface-elevada)]/60 border border-[var(--border)] space-y-2.5"
            >
              <input
                type="text"
                autoFocus
                placeholder="Nome da nova coluna..."
                value={novoTituloColuna}
                onChange={(e) => setNovoTituloColuna(e.target.value)}
                className="w-full text-xs p-2 rounded bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCriandoColuna(false);
                    setNovoTituloColuna("");
                  }}
                  className="p-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
                <Botao tamanho="sm" type="submit" carregando={salvandoColuna}>
                  Adicionar Coluna
                </Botao>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setCriandoColuna(true)}
              className="w-72 shrink-0 flex items-center justify-center gap-2 p-3.5 rounded-[var(--raio-lg)] border border-dashed border-[var(--border)] text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--surface-elevada)]/30 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Coluna</span>
            </button>
          )}
        </div>

        {/* DragOverlay com sombra e elevação estética */}
        <DragOverlay>
          {cartaoAtivo ? (
            <div className="superficie-glass p-3 rounded-[var(--raio-md)] border border-[var(--accent)] shadow-[var(--sombra-lg)] rotate-2 scale-105 cursor-grabbing opacity-95 space-y-2 pointer-events-none">
              <h4 className="text-xs font-semibold text-[var(--foreground)]">
                {cartaoAtivo.titulo}
              </h4>
              {cartaoAtivo.prioridade !== "nenhuma" && (
                <Badge variante="padrao" tamanho="sm">
                  {cartaoAtivo.prioridade}
                </Badge>
              )}
            </div>
          ) : null}
        </DragOverlay>

        {/* Modal de Detalhes do Cartão Selecionado */}
        {cartaoSelecionado && (
          <DialogCartao
            cartao={cartaoSelecionado}
            colunas={colunas}
            aoFechar={() => setCartaoSelecionado(null)}
            aoAtualizar={aoAtualizar}
          />
        )}
      </div>
    </DndContext>
  );
}
