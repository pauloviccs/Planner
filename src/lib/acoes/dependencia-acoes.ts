"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import { revalidatePath } from "next/cache";

export interface ItemDependenciaCartao {
  id: string;
  cartao_id: string;
  titulo: string;
  coluna_id: string;
  coluna_titulo?: string;
  prioridade: string;
  status: string;
  concluido: boolean;
}

export interface DependenciasResultado {
  bloqueadores: ItemDependenciaCartao[]; // Cartões que BLOQUEIAM este cartão
  bloqueados: ItemDependenciaCartao[];   // Cartões que este cartão BLOQUEIA
}

/**
 * Busca dependências ativas de um cartão específico
 */
export async function obterDependenciasDoCartao(cartaoId: string): Promise<DependenciasResultado> {
  const supabase = await criarClienteServidor();

  // 1. Buscar quem bloqueia este cartão (cartao_bloqueador_id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: relacoesBloqueadores, error: erro1 } = await (supabase.from("dependencias_cartoes") as any)
    .select(`
      id,
      cartao_bloqueador:cartao_bloqueador_id (
        id,
        titulo,
        coluna_id,
        prioridade,
        status,
        colunas:coluna_id (
          titulo
        )
      )
    `)
    .eq("cartao_origem_id", cartaoId);

  // 2. Buscar quem é bloqueado por este cartão (cartao_origem_id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: relacoesBloqueados, error: erro2 } = await (supabase.from("dependencias_cartoes") as any)
    .select(`
      id,
      cartao_origem:cartao_origem_id (
        id,
        titulo,
        coluna_id,
        prioridade,
        status,
        colunas:coluna_id (
          titulo
        )
      )
    `)
    .eq("cartao_bloqueador_id", cartaoId);

  if (erro1 || erro2) {
    console.error("[VICCS Planner] Erro ao buscar dependências:", erro1 || erro2);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatarItem = (idRelacao: string, c: any): ItemDependenciaCartao => {
    const nomeColuna = c?.colunas?.titulo?.toLowerCase() || "";
    const ehConcluido =
      c?.status === "concluido" ||
      nomeColuna.includes("conclu") ||
      nomeColuna.includes("done") ||
      nomeColuna.includes("finaliz");

    return {
      id: idRelacao,
      cartao_id: c?.id,
      titulo: c?.titulo || "Sem título",
      coluna_id: c?.coluna_id,
      coluna_titulo: c?.colunas?.titulo || "Coluna",
      prioridade: c?.prioridade || "nenhuma",
      status: c?.status || "aberto",
      concluido: Boolean(ehConcluido),
    };
  };

  const bloqueadores = (relacoesBloqueadores || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => r.cartao_bloqueador)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => formatarItem(r.id, r.cartao_bloqueador));

  const bloqueados = (relacoesBloqueados || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => r.cartao_origem)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => formatarItem(r.id, r.cartao_origem));

  return { bloqueadores, bloqueados };
}

/**
 * Adiciona uma regra de dependência: cartaoOrigem depende de cartaoBloqueador
 */
export async function adicionarDependenciaAcao(
  workspaceId: string,
  cartaoOrigemId: string,
  cartaoBloqueadorId: string
) {
  if (cartaoOrigemId === cartaoBloqueadorId) {
    return { sucesso: false, erro: "Um cartão não pode depender de si mesmo." };
  }

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { sucesso: false, erro: "Usuário não autenticado." };
  }

  // Prevenção de ciclo direto: verificar se o bloqueador já depende da origem
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cicloExiste } = await (supabase.from("dependencias_cartoes") as any)
    .select("id")
    .eq("cartao_origem_id", cartaoBloqueadorId)
    .eq("cartao_bloqueador_id", cartaoOrigemId)
    .maybeSingle();

  if (cicloExiste) {
    return {
      sucesso: false,
      erro: "Dependência circular detectada! O cartão selecionado já depende deste cartão.",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("dependencias_cartoes") as any).insert({
    workspace_id: workspaceId,
    cartao_origem_id: cartaoOrigemId,
    cartao_bloqueador_id: cartaoBloqueadorId,
  });

  if (error) {
    if (error.code === "23505") {
      return { sucesso: false, erro: "Esta dependência já está cadastrada." };
    }
    console.error("[VICCS Planner] Erro ao criar dependência:", error);
    return { sucesso: false, erro: "Falha ao vincular dependência." };
  }

  revalidatePath(`/${workspaceId}`);
  return { sucesso: true };
}

/**
 * Remove uma relação de dependência pelo ID da relação
 */
export async function removerDependenciaAcao(dependenciaId: string, workspaceId: string) {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { sucesso: false, erro: "Usuário não autenticado." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("dependencias_cartoes") as any)
    .delete()
    .eq("id", dependenciaId);

  if (error) {
    console.error("[VICCS Planner] Erro ao remover dependência:", error);
    return { sucesso: false, erro: "Falha ao desvincular dependência." };
  }

  revalidatePath(`/${workspaceId}`);
  return { sucesso: true };
}
