"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import { revalidatePath } from "next/cache";

/**
 * Alterna a visibilidade pública de uma página gerando ou mantendo um token único.
 */
export async function alternarCompartilhamentoPagina(
  paginaId: string,
  publico: boolean
) {
  const supabase = await criarClienteServidor();

  // Verifica se já possui token_publico
  const { data: paginaAtual } = await supabase
    .from("paginas")
    .select("token_publico, workspace_id")
    .eq("id", paginaId)
    .single();

  let token = paginaAtual?.token_publico;
  if (!token && publico) {
    token = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  }

  const { data, error } = await supabase
    .from("paginas")
    .update({
      publico,
      token_publico: token,
    })
    .eq("id", paginaId)
    .select("id, publico, token_publico, workspace_id")
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Erro ao atualizar compartilhamento da página." };
  }

  revalidatePath(`/${data.workspace_id}/paginas/${paginaId}`);
  return {
    sucesso: true,
    publico: data.publico,
    tokenPublico: data.token_publico,
  };
}

/**
 * Alterna a visibilidade pública de um projeto (quadro Kanban).
 */
export async function alternarCompartilhamentoProjeto(
  projetoId: string,
  publico: boolean
) {
  const supabase = await criarClienteServidor();

  const { data: projetoAtual } = await supabase
    .from("projetos")
    .select("token_publico, workspace_id")
    .eq("id", projetoId)
    .single();

  let token = projetoAtual?.token_publico;
  if (!token && publico) {
    token = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  }

  const { data, error } = await supabase
    .from("projetos")
    .update({
      publico,
      token_publico: token,
    })
    .eq("id", projetoId)
    .select("id, publico, token_publico, workspace_id")
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Erro ao atualizar compartilhamento do projeto." };
  }

  revalidatePath(`/${data.workspace_id}/projetos/${projetoId}`);
  return {
    sucesso: true,
    publico: data.publico,
    tokenPublico: data.token_publico,
  };
}

/**
 * Busca uma página pública pelo token (acessível por visitantes anônimos).
 */
export async function obterPaginaPublica(token: string) {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("paginas")
    .select(`
      id,
      titulo,
      icone,
      conteudo,
      atualizado_em,
      publico,
      token_publico
    `)
    .eq("token_publico", token)
    .eq("publico", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Busca um projeto público completo pelo token (acessível por visitantes anônimos).
 */
export async function obterProjetoPublico(token: string) {
  const supabase = await criarClienteServidor();

  const { data: projeto, error: erroProjeto } = await supabase
    .from("projetos")
    .select("id, nome, descricao, icone, cor, publico, token_publico")
    .eq("token_publico", token)
    .eq("publico", true)
    .maybeSingle();

  if (erroProjeto || !projeto) {
    return null;
  }

  // Busca o quadro principal do projeto
  const { data: quadros } = await supabase
    .from("quadros")
    .select("id, nome")
    .eq("projeto_id", projeto.id)
    .order("posicao", { ascending: true })
    .limit(1);

  const quadroPrincipal = quadros?.[0];
  if (!quadroPrincipal) {
    return {
      projeto,
      colunas: [],
    };
  }

  // Busca as colunas do quadro
  const { data: colunas } = await supabase
    .from("colunas")
    .select("id, titulo, cor, posicao")
    .eq("quadro_id", quadroPrincipal.id)
    .order("posicao", { ascending: true });

  if (!colunas || colunas.length === 0) {
    return {
      projeto,
      colunas: [],
    };
  }

  const idsColunas = colunas.map((c) => c.id);

  // Busca os cartões das colunas
  const { data: cartoes } = await supabase
    .from("cartoes")
    .select(`
      id,
      coluna_id,
      titulo,
      descricao,
      prioridade,
      status,
      data_inicio,
      data_vencimento,
      posicao,
      criado_em
    `)
    .in("coluna_id", idsColunas)
    .eq("arquivado", false)
    .order("posicao", { ascending: true });

  const colunasComCartoes = colunas.map((coluna) => ({
    ...coluna,
    cartoes: (cartoes || []).filter((cartao) => cartao.coluna_id === coluna.id),
  }));

  return {
    projeto,
    quadro: quadroPrincipal,
    colunas: colunasComCartoes,
  };
}
