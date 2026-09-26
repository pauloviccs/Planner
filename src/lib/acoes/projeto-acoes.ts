"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import { revalidatePath } from "next/cache";

export interface ProjetoResumo {
  id: string;
  workspace_id: string;
  nome: string;
  descricao: string | null;
  icone: string;
  cor: string;
  arquivado: boolean;
  publico?: boolean;
  token_publico?: string | null;
  criado_em: string;
}

export interface ItemChecklist {
  id: string;
  checklist_id: string;
  texto: string;
  concluido: boolean;
  posicao: number;
}

export interface ChecklistComItens {
  id: string;
  cartao_id: string;
  titulo: string;
  posicao: number;
  itens: ItemChecklist[];
}

export interface CartaoCompleto {
  id: string;
  coluna_id: string;
  workspace_id: string;
  criado_por: string | null;
  titulo: string;
  descricao: string | null;
  prioridade: "nenhuma" | "baixa" | "media" | "alta" | "urgente";
  status: "aberto" | "em_progresso" | "concluido" | "arquivado";
  data_inicio: string | null;
  data_vencimento: string | null;
  posicao: number;
  arquivado: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadados: any;
  criado_em: string;
  checklists?: ChecklistComItens[];
}

export interface ColunaComCartoes {
  id: string;
  quadro_id: string;
  titulo: string;
  cor: string;
  posicao: number;
  limite_wip: number | null;
  cartoes: CartaoCompleto[];
}

export interface QuadroDetalhe {
  id: string;
  projeto_id: string;
  workspace_id: string;
  nome: string;
  posicao: number;
  colunas: ColunaComCartoes[];
}

/**
 * Retorna todos os projetos do workspace.
 */
export async function obterProjetosDoWorkspace(
  workspaceId: string
): Promise<ProjetoResumo[]> {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("projetos")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("arquivado", false)
    .order("criado_em", { ascending: true });

  if (error || !data) return [];
  return data as ProjetoResumo[];
}

/**
 * Retorna um projeto por ID juntamente com seus quadros.
 */
export async function obterProjetoPorId(projetoId: string): Promise<ProjetoResumo | null> {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("projetos")
    .select("*")
    .eq("id", projetoId)
    .single();

  if (error || !data) return null;
  return data as ProjetoResumo;
}

/**
 * Retorna a estrutura completa do Quadro Kanban (colunas, cartões e checklists).
 */
export async function obterQuadroCompleto(quadroId: string): Promise<QuadroDetalhe | null> {
  const supabase = await criarClienteServidor();

  // 1. Busca dados do quadro
  const { data: quadro, error: erroQuadro } = await supabase
    .from("quadros")
    .select("*")
    .eq("id", quadroId)
    .single();

  if (erroQuadro || !quadro) return null;

  // 2. Busca colunas
  const { data: colunas, error: erroColunas } = await supabase
    .from("colunas")
    .select("*")
    .eq("quadro_id", quadroId)
    .order("posicao", { ascending: true });

  if (erroColunas || !colunas) {
    return { ...quadro, colunas: [] };
  }

  const idsColunas = colunas.map((c) => c.id);

  // 3. Busca cartões pertencentes a essas colunas
  const { data: cartoes } = await supabase
    .from("cartoes")
    .select("*")
    .in("coluna_id", idsColunas.length > 0 ? idsColunas : ["00000000-0000-0000-0000-000000000000"])
    .eq("arquivado", false)
    .order("posicao", { ascending: true });

  const idsCartoes = cartoes ? cartoes.map((c) => c.id) : [];

  // 4. Busca checklists e itens
  let checklistsComItens: Record<string, ChecklistComItens[]> = {};
  if (idsCartoes.length > 0) {
    const { data: checklists } = await supabase
      .from("checklists")
      .select("*")
      .in("cartao_id", idsCartoes)
      .order("posicao", { ascending: true });

    if (checklists && checklists.length > 0) {
      const idsChecklists = checklists.map((ch) => ch.id);
      const { data: itens } = await supabase
        .from("itens_checklist")
        .select("*")
        .in("checklist_id", idsChecklists)
        .order("posicao", { ascending: true });

      const mapaItens: Record<string, ItemChecklist[]> = {};
      itens?.forEach((item) => {
        if (!mapaItens[item.checklist_id]) mapaItens[item.checklist_id] = [];
        mapaItens[item.checklist_id].push(item as ItemChecklist);
      });

      checklistsComItens = checklists.reduce((acc, ch) => {
        if (!acc[ch.cartao_id]) acc[ch.cartao_id] = [];
        acc[ch.cartao_id].push({
          id: ch.id,
          cartao_id: ch.cartao_id,
          titulo: ch.titulo,
          posicao: ch.posicao,
          itens: mapaItens[ch.id] || [],
        });
        return acc;
      }, {} as Record<string, ChecklistComItens[]>);
    }
  }

  // Agrupa cartões em cada coluna
  const colunasFormatadas: ColunaComCartoes[] = colunas.map((coluna) => {
    const cartoesDaColuna = (cartoes || [])
      .filter((c) => c.coluna_id === coluna.id)
      .map((c) => ({
        ...c,
        checklists: checklistsComItens[c.id] || [],
      })) as CartaoCompleto[];

    return {
      id: coluna.id,
      quadro_id: coluna.quadro_id,
      titulo: coluna.titulo,
      cor: coluna.cor,
      posicao: coluna.posicao,
      limite_wip: coluna.limite_wip,
      cartoes: cartoesDaColuna,
    };
  });

  return {
    id: quadro.id,
    projeto_id: quadro.projeto_id,
    workspace_id: quadro.workspace_id,
    nome: quadro.nome,
    posicao: quadro.posicao,
    colunas: colunasFormatadas,
  };
}

/**
 * Cria um novo projeto e seu quadro principal.
 */
export async function criarProjetoAcao(
  workspaceId: string,
  dados: { nome: string; descricao?: string; cor?: string; icone?: string }
) {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projeto, error: erroProjeto } = await supabase
    .from("projetos")
    .insert({
      workspace_id: workspaceId,
      criado_por: user?.id,
      nome: dados.nome.trim(),
      descricao: dados.descricao || "",
      cor: dados.cor || "#3b82f6",
      icone: dados.icone || "FolderKanban",
    })
    .select()
    .single();

  if (erroProjeto || !projeto) {
    return { sucesso: false, mensagem: "Erro ao criar projeto." };
  }

  // Cria quadro principal com colunas padrão
  const { data: quadro } = await supabase
    .from("quadros")
    .insert({
      projeto_id: projeto.id,
      workspace_id: workspaceId,
      nome: "Quadro Principal",
      posicao: 0,
    })
    .select()
    .single();

  if (quadro) {
    await supabase.from("colunas").insert([
      { quadro_id: quadro.id, titulo: "A Fazer", cor: "#64748b", posicao: 0 },
      { quadro_id: quadro.id, titulo: "Em Andamento", cor: "#3b82f6", posicao: 1 },
      { quadro_id: quadro.id, titulo: "Concluído", cor: "#10b981", posicao: 2 },
    ]);
  }

  revalidatePath(`/${workspaceId}`, "layout");
  return { sucesso: true, projeto };
}

/**
 * Adiciona uma coluna ao quadro.
 */
export async function criarColunaAcao(quadroId: string, titulo: string, cor = "#64748b") {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("colunas")
    .insert({
      quadro_id: quadroId,
      titulo: titulo.trim(),
      cor,
      posicao: 99,
    })
    .select()
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Erro ao adicionar coluna." };
  }

  return { sucesso: true, coluna: data };
}

/**
 * Cria um novo cartão em uma coluna.
 */
export async function criarCartaoAcao(
  colunaId: string,
  workspaceId: string,
  dados: {
    titulo: string;
    prioridade?: "nenhuma" | "baixa" | "media" | "alta" | "urgente";
    data_vencimento?: string | null;
    descricao?: string;
  }
) {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("cartoes")
    .insert({
      coluna_id: colunaId,
      workspace_id: workspaceId,
      criado_por: user?.id,
      titulo: dados.titulo.trim(),
      descricao: dados.descricao || "",
      prioridade: dados.prioridade || "nenhuma",
      data_vencimento: dados.data_vencimento || null,
      posicao: 99,
    })
    .select()
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Erro ao adicionar cartão." };
  }

  // Registra atividade no workspace
  try {
    await supabase.from("atividades").insert({
      workspace_id: workspaceId,
      ator_id: user?.id,
      acao: "criou_cartao",
      recurso_tipo: "cartao",
      recurso_id: data.id,
      detalhes: { titulo: data.titulo },
    });
  } catch (err) {
    console.error("Falha ao registrar atividade de criação de cartão:", err);
  }

  return { sucesso: true, cartao: data };
}

/**
 * Atualiza propriedades do cartão (título, descrição, prioridade, status, coluna, etc.).
 */
export async function atualizarCartaoAcao(
  cartaoId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dados: any
) {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("cartoes")
    .update(dados)
    .eq("id", cartaoId)
    .select()
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Erro ao atualizar cartão." };
  }

  // Registra atividade se for mudança de coluna ou conclusão
  try {
    let acao = "atualizou_cartao";
    if (dados.coluna_id) acao = "moveu_cartao";
    if (dados.status === "concluido") acao = "concluiu_cartao";

    await supabase.from("atividades").insert({
      workspace_id: data.workspace_id,
      ator_id: user?.id,
      acao,
      recurso_tipo: "cartao",
      recurso_id: data.id,
      detalhes: { titulo: data.titulo },
    });
  } catch (err) {
    console.error("Falha ao registrar atividade de atualização de cartão:", err);
  }

  return { sucesso: true, cartao: data };
}


/**
 * Cria um checklist dentro de um cartão.
 */
export async function criarChecklistAcao(cartaoId: string, titulo = "Tarefas") {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("checklists")
    .insert({
      cartao_id: cartaoId,
      titulo: titulo.trim(),
      posicao: 0,
    })
    .select()
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Erro ao criar checklist." };
  }

  return { sucesso: true, checklist: data };
}

/**
 * Adiciona um item ao checklist.
 */
export async function adicionarItemChecklistAcao(checklistId: string, texto: string) {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("itens_checklist")
    .insert({
      checklist_id: checklistId,
      texto: texto.trim(),
      concluido: false,
      posicao: 99,
    })
    .select()
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Erro ao adicionar item de checklist." };
  }

  return { sucesso: true, item: data };
}

/**
 * Alterna estado de conclusão de um item do checklist.
 */
export async function alternarItemChecklistAcao(itemId: string, concluido: boolean) {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("itens_checklist")
    .update({ concluido })
    .eq("id", itemId)
    .select()
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Erro ao atualizar item." };
  }

  return { sucesso: true, item: data };
}
