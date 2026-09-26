"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import { revalidatePath } from "next/cache";

export interface PaginaResumo {
  id: string;
  workspace_id: string;
  pagina_pai_id: string | null;
  titulo: string;
  icone: string;
  posicao: number;
  favorita: boolean;
  arquivada: boolean;
  publico?: boolean;
  token_publico?: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface PaginaDetalhe extends PaginaResumo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conteudo: any;
}

/**
 * Retorna as páginas de um workspace (excluindo arquivadas por padrão).
 */
export async function obterPaginasDoWorkspace(
  workspaceId: string,
  incluirArquivadas = false
): Promise<PaginaResumo[]> {
  const supabase = await criarClienteServidor();

  let consulta = supabase
    .from("paginas")
    .select("id, workspace_id, pagina_pai_id, titulo, icone, posicao, favorita, arquivada, criado_em, atualizado_em")
    .eq("workspace_id", workspaceId)
    .order("posicao", { ascending: true })
    .order("criado_em", { ascending: true });

  if (!incluirArquivadas) {
    consulta = consulta.eq("arquivada", false);
  }

  const { data, error } = await consulta;
  if (error || !data) return [];
  return data as PaginaResumo[];
}

/**
 * Retorna uma página específica com seu conteúdo completo.
 */
export async function obterPaginaPorId(paginaId: string): Promise<PaginaDetalhe | null> {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("paginas")
    .select("*")
    .eq("id", paginaId)
    .single();

  if (error || !data) return null;
  return data as PaginaDetalhe;
}

/**
 * Cria uma nova página no workspace.
 */
export async function criarPaginaAcao(
  workspaceId: string,
  titulo = "Sem título",
  paginaPaiId?: string | null
) {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("paginas")
    .insert({
      workspace_id: workspaceId,
      criado_por: user?.id,
      pagina_pai_id: paginaPaiId || null,
      titulo: titulo.trim() || "Sem título",
      icone: "FileText",
      conteudo: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Comece a digitar seu documento aqui..." }],
        },
      ],
      posicao: 0,
    })
    .select()
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Não foi possível criar a página." };
  }

  // Registra atividade
  if (user) {
    await supabase.from("atividades").insert({
      workspace_id: workspaceId,
      ator_id: user.id,
      acao: "criou a página",
      recurso_tipo: "pagina",
      recurso_id: data.id,
      detalhes: { titulo: data.titulo },
    });
  }

  revalidatePath(`/${workspaceId}`, "layout");
  return { sucesso: true, pagina: data as PaginaDetalhe };
}

/**
 * Atualiza campos de uma página (título, ícone, conteúdo ou favorita).
 */
export async function atualizarPaginaAcao(
  paginaId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dados: {
    titulo?: string;
    icone?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conteudo?: any;
    favorita?: boolean;
    arquivada?: boolean;
  }
) {
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase
    .from("paginas")
    .update({
      ...(dados.titulo !== undefined && { titulo: dados.titulo }),
      ...(dados.icone !== undefined && { icone: dados.icone }),
      ...(dados.conteudo !== undefined && { conteudo: dados.conteudo }),
      ...(dados.favorita !== undefined && { favorita: dados.favorita }),
      ...(dados.arquivada !== undefined && { arquivada: dados.arquivada }),
    })
    .eq("id", paginaId)
    .select()
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Erro ao salvar alterações da página." };
  }

  return { sucesso: true, pagina: data as PaginaDetalhe };
}

/**
 * Exclui permanentemente uma página.
 */
export async function excluirPaginaAcao(paginaId: string, workspaceId: string) {
  const supabase = await criarClienteServidor();

  const { error } = await supabase.from("paginas").delete().eq("id", paginaId);

  if (error) {
    return { sucesso: false, mensagem: "Erro ao excluir página." };
  }

  revalidatePath(`/${workspaceId}`, "layout");
  return { sucesso: true };
}
