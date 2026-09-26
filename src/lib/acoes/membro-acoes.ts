"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import { revalidatePath } from "next/cache";

export interface MembroDetalhe {
  id: string;
  workspace_id: string;
  usuario_id: string;
  papel: "proprietario" | "admin" | "membro" | "convidado";
  criado_em: string;
  perfil?: {
    id: string;
    nome_completo: string | null;
    avatar_url: string | null;
    email: string;
  };
}

/**
 * Retorna todos os membros de um workspace com detalhes de perfil.
 */
export async function obterMembrosWorkspace(
  workspaceId: string
): Promise<MembroDetalhe[]> {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("membros_workspace")
    .select(`
      id,
      workspace_id,
      usuario_id,
      papel,
      criado_em,
      perfil:perfis (
        id,
        nome_completo,
        avatar_url,
        email
      )
    `)
    .eq("workspace_id", workspaceId)
    .order("criado_em", { ascending: true });

  if (error || !data) return [];
  return data as unknown as MembroDetalhe[];
}

/**
 * Convida ou adiciona um membro pelo e-mail ao workspace.
 */
export async function convidarMembroAcao(
  workspaceId: string,
  email: string,
  papel: "admin" | "membro" | "convidado" = "membro"
) {
  if (!email.trim() || !email.includes("@")) {
    return { sucesso: false, mensagem: "Insira um e-mail válido." };
  }

  const supabase = await criarClienteServidor();

  // Verifica se o usuário com este e-mail já existe na tabela de perfis
  const { data: usuarioExistente } = await supabase
    .from("perfis")
    .select("id, email")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (!usuarioExistente) {
    return {
      sucesso: false,
      mensagem:
        "Nenhum usuário cadastrado com este e-mail. Peça para a pessoa se cadastrar primeiro no VICCS Planner.",
    };
  }

  // Verifica se já é membro
  const { data: jaMembro } = await supabase
    .from("membros_workspace")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("usuario_id", usuarioExistente.id)
    .single();

  if (jaMembro) {
    return {
      sucesso: false,
      mensagem: "Este usuário já faz parte deste workspace.",
    };
  }

  // Insere membro
  const { error } = await supabase.from("membros_workspace").insert({
    workspace_id: workspaceId,
    usuario_id: usuarioExistente.id,
    papel,
  });

  if (error) {
    return {
      sucesso: false,
      mensagem: "Erro ao adicionar membro ao workspace.",
    };
  }

  revalidatePath(`/${workspaceId}/configuracoes`, "layout");
  return {
    sucesso: true,
    mensagem: "Membro adicionado com sucesso!",
  };
}

/**
 * Remove um membro do workspace.
 */
export async function removerMembroAcao(workspaceId: string, usuarioId: string) {
  const supabase = await criarClienteServidor();

  const { error } = await supabase
    .from("membros_workspace")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("usuario_id", usuarioId);

  if (error) {
    return { sucesso: false, mensagem: "Erro ao remover membro." };
  }

  revalidatePath(`/${workspaceId}/configuracoes`, "layout");
  return { sucesso: true };
}
