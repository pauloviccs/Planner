"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";

export interface AtividadeItem {
  id: string;
  workspace_id: string;
  ator_id: string | null;
  acao: string;
  recurso_tipo: string;
  recurso_id: string;
  detalhes: Record<string, any>;
  criado_em: string;
  perfis?: {
    id: string;
    nome_completo: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Registra um evento de atividade no workspace.
 */
export async function registrarAtividadeAcao(dados: {
  workspaceId: string;
  acao: string;
  recursoTipo: string;
  recursoId: string;
  detalhes?: Record<string, any>;
}) {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("atividades").insert({
    workspace_id: dados.workspaceId,
    ator_id: user?.id || null,
    acao: dados.acao,
    recurso_tipo: dados.recursoTipo,
    recurso_id: dados.recursoId,
    detalhes: dados.detalhes || {},
  });

  if (error) {
    console.error("[VICCS Planner] Erro ao registrar atividade:", error);
    return { sucesso: false };
  }

  return { sucesso: true };
}

/**
 * Obtém as atividades mais recentes de um workspace.
 */
export async function obterAtividadesWorkspace(
  workspaceId: string,
  limite = 30
): Promise<AtividadeItem[]> {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("atividades")
    .select(`
      id,
      workspace_id,
      ator_id,
      acao,
      recurso_tipo,
      recurso_id,
      detalhes,
      criado_em,
      perfis:ator_id (
        id,
        nome_completo,
        avatar_url
      )
    `)
    .eq("workspace_id", workspaceId)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error || !data) {
    return [];
  }

  return data as unknown as AtividadeItem[];
}
