"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import { revalidatePath } from "next/cache";

export interface ComentarioDetalhe {
  id: string;
  recurso_tipo: "pagina" | "cartao";
  recurso_id: string;
  autor_id: string;
  conteudo: string;
  criado_em: string;
  autor?: {
    id: string;
    nome_completo: string | null;
    avatar_url: string | null;
    email: string;
  };
}

/**
 * Retorna todos os comentários vinculados a uma página ou cartão.
 */
export async function obterComentarios(
  recursoTipo: "pagina" | "cartao",
  recursoId: string
): Promise<ComentarioDetalhe[]> {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("atividades")
    .select(`
      id,
      acao,
      recurso_tipo,
      recurso_id,
      ator_id,
      detalhes,
      criado_em,
      perfil:perfis (
        id,
        nome_completo,
        avatar_url,
        email
      )
    `)
    .eq("recurso_tipo", recursoTipo)
    .eq("recurso_id", recursoId)
    .eq("acao", "comentou")
    .order("criado_em", { ascending: true });

  if (error || !data) return [];

  return data.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detalhes = (item.detalhes as any) || {};
    return {
      id: item.id,
      recurso_tipo: recursoTipo,
      recurso_id: recursoId,
      autor_id: item.ator_id || "",
      conteudo: detalhes.conteudo || "",
      criado_em: item.criado_em,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      autor: item.perfil as any,
    };
  });
}

/**
 * Adiciona um comentário a uma página ou cartão.
 */
export async function adicionarComentarioAcao(
  workspaceId: string,
  recursoTipo: "pagina" | "cartao",
  recursoId: string,
  conteudo: string
) {
  if (!conteudo.trim()) {
    return { sucesso: false, mensagem: "O comentário não pode ser vazio." };
  }

  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { sucesso: false, mensagem: "Usuário não autenticado." };
  }

  const { data, error } = await supabase
    .from("atividades")
    .insert({
      workspace_id: workspaceId,
      ator_id: user.id,
      acao: "comentou",
      recurso_tipo: recursoTipo,
      recurso_id: recursoId,
      detalhes: { conteudo: conteudo.trim() },
    })
    .select()
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Não foi possível registrar o comentário." };
  }

  revalidatePath("/", "layout");
  return { sucesso: true, comentario: data };
}
