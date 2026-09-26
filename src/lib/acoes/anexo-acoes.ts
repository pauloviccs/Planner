"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import { revalidatePath } from "next/cache";

export interface AnexoRecurso {
  id: string;
  workspace_id: string;
  recurso_tipo: "cartao" | "pagina";
  recurso_id: string;
  nome_arquivo: string;
  tamanho_bytes: number;
  mime_type: string;
  caminho_storage: string;
  url_publica: string;
  criado_por: string;
  criado_em: string;
}

export interface RegistrarAnexoEntrada {
  workspaceId: string;
  recursoTipo: "cartao" | "pagina";
  recursoId: string;
  nomeArquivo: string;
  tamanhoBytes: number;
  mimeType: string;
  caminhoStorage: string;
  urlPublica: string;
}

/**
 * Registra os metadados de um anexo no banco de dados e registra a atividade
 */
export async function registrarAnexoAcao(dados: RegistrarAnexoEntrada) {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { sucesso: false, erro: "Usuário não autenticado." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: anexoCriado, error: erroAnexo } = await (supabase.from("anexos_recursos") as any)
    .insert({
      workspace_id: dados.workspaceId,
      recurso_tipo: dados.recursoTipo,
      recurso_id: dados.recursoId,
      nome_arquivo: dados.nomeArquivo,
      tamanho_bytes: dados.tamanhoBytes,
      mime_type: dados.mimeType,
      caminho_storage: dados.caminhoStorage,
      url_publica: dados.urlPublica,
      criado_por: user.id,
    })
    .select()
    .single();

  if (erroAnexo || !anexoCriado) {
    console.error("[VICCS Planner] Erro ao registrar anexo:", erroAnexo);
    return { sucesso: false, erro: erroAnexo?.message || "Erro ao registrar anexo no banco." };
  }

  // Registrar atividade no workspace
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("atividades") as any).insert({
      workspace_id: dados.workspaceId,
      ator_id: user.id,
      acao: "anexou_arquivo",
      recurso_tipo: dados.recursoTipo,
      recurso_id: dados.recursoId,
      detalhes: {
        nome_arquivo: dados.nomeArquivo,
        tamanho_bytes: dados.tamanhoBytes,
      },
    });
  } catch (errAtiv) {
    console.warn("[VICCS Planner] Falha silenciosa ao registrar atividade de anexo:", errAtiv);
  }

  revalidatePath(`/${dados.workspaceId}`);
  return { sucesso: true, anexo: anexoCriado as AnexoRecurso };
}

/**
 * Obtém todos os anexos vinculados a um cartão ou página
 */
export async function obterAnexosDoRecurso(
  recursoTipo: "cartao" | "pagina",
  recursoId: string
): Promise<AnexoRecurso[]> {
  const supabase = await criarClienteServidor();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("anexos_recursos") as any)
    .select("*")
    .eq("recurso_tipo", recursoTipo)
    .eq("recurso_id", recursoId)
    .order("criado_em", { ascending: false });

  if (error || !data) {
    console.error("[VICCS Planner] Erro ao buscar anexos:", error);
    return [];
  }

  return data as AnexoRecurso[];
}

/**
 * Exclui um anexo tanto do Supabase Storage quanto do banco de dados
 */
export async function deletarAnexoAcao(anexoId: string, workspaceId: string) {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { sucesso: false, erro: "Usuário não autenticado." };
  }

  // 1. Obter caminho do arquivo no storage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: anexo, error: erroBusca } = await (supabase.from("anexos_recursos") as any)
    .select("caminho_storage, workspace_id, nome_arquivo")
    .eq("id", anexoId)
    .single();

  if (erroBusca || !anexo) {
    return { sucesso: false, erro: "Anexo não encontrado." };
  }

  // 2. Remover do Supabase Storage
  const { error: erroStorage } = await supabase.storage
    .from("workspace-arquivos")
    .remove([anexo.caminho_storage]);

  if (erroStorage) {
    console.warn("[VICCS Planner] Aviso ao remover do storage:", erroStorage);
  }

  // 3. Remover registro da tabela
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: erroDelete } = await (supabase.from("anexos_recursos") as any)
    .delete()
    .eq("id", anexoId);

  if (erroDelete) {
    console.error("[VICCS Planner] Erro ao deletar anexo:", erroDelete);
    return { sucesso: false, erro: "Erro ao deletar anexo no banco." };
  }

  revalidatePath(`/${workspaceId}`);
  return { sucesso: true };
}
