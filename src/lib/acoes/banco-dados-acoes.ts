"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import { revalidatePath } from "next/cache";

export interface PropriedadeBanco {
  id: string;
  banco_id: string;
  nome: string;
  tipo:
    | "texto"
    | "numero"
    | "selecao"
    | "multi_selecao"
    | "status"
    | "data"
    | "checkbox"
    | "email"
    | "url";
  ordem: number;
  configuracoes: {
    opcoes?: string[];
    [key: string]: any;
  };
  criado_em: string;
}

export interface RegistroBanco {
  id: string;
  banco_id: string;
  criado_por: string | null;
  titulo: string;
  icone: string;
  valores: Record<string, any>;
  conteudo: any;
  ordem: number;
  arquivado: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface BancoComDetalhes {
  id: string;
  workspace_id: string;
  criado_por: string | null;
  nome: string;
  descricao: string | null;
  icone: string;
  visao_padrao: "tabela" | "galeria" | "lista";
  criado_em: string;
  atualizado_em: string;
  propriedades: PropriedadeBanco[];
  registros: RegistroBanco[];
}

/**
 * Retorna todos os bancos de dados de um workspace.
 */
export async function obterBancosWorkspace(workspaceId: string) {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("bancos_dados")
    .select("id, nome, descricao, icone, visao_padrao, criado_em, atualizado_em")
    .eq("workspace_id", workspaceId)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("[VICCS Planner] Erro ao obter bancos:", error);
    return [];
  }

  return data || [];
}

/**
 * Retorna uma base de dados completa com suas propriedades e registros.
 */
export async function obterBancoComDetalhes(
  bancoId: string
): Promise<BancoComDetalhes | null> {
  const supabase = await criarClienteServidor();

  // 1. Obter o banco
  const { data: banco, error: erroBanco } = await supabase
    .from("bancos_dados")
    .select("*")
    .eq("id", bancoId)
    .single();

  if (erroBanco || !banco) {
    console.error("[VICCS Planner] Erro ao carregar banco:", erroBanco);
    return null;
  }

  // 2. Obter propriedades
  const { data: props } = await supabase
    .from("propriedades_banco")
    .select("*")
    .eq("banco_id", bancoId)
    .order("ordem", { ascending: true });

  // 3. Obter registros não arquivados
  const { data: registros } = await supabase
    .from("registros_banco")
    .select("*")
    .eq("banco_id", bancoId)
    .eq("arquivado", false)
    .order("ordem", { ascending: true });

  return {
    ...banco,
    propriedades: (props as unknown as PropriedadeBanco[]) || [],
    registros: (registros as unknown as RegistroBanco[]) || [],
  };
}

/**
 * Cria uma nova base de dados no workspace e configura propriedades padrão.
 */
export async function criarBancoAcao(
  workspaceId: string,
  nome: string,
  descricao: string = "",
  visaoPadrao: "tabela" | "galeria" | "lista" = "tabela"
) {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { sucesso: false, mensagem: "Usuário não autenticado." };
  }

  // 1. Inserir o banco
  const { data: novoBanco, error: erroCriar } = await supabase
    .from("bancos_dados")
    .insert({
      workspace_id: workspaceId,
      criado_por: user.id,
      nome: nome.trim() || "Nova Base de Dados",
      descricao,
      visao_padrao: visaoPadrao,
      icone: "Database",
    })
    .select()
    .single();

  if (erroCriar || !novoBanco) {
    console.error("[VICCS Planner] Erro ao criar banco de dados:", erroCriar);
    return {
      sucesso: false,
      mensagem:
        erroCriar?.code === "PGRST205"
          ? "As tabelas de banco dinâmico ainda não foram criadas no Supabase. Execute a migração 00002_esquema_fase3_bancos_dados.sql."
          : "Erro ao criar banco de dados.",
    };
  }

  // 2. Criar propriedades padrão recomendadas
  const propsPadrao = [
    {
      banco_id: novoBanco.id,
      nome: "Status",
      tipo: "status",
      ordem: 0,
      configuracoes: { opcoes: ["Não iniciado", "Em andamento", "Concluído"] },
    },
    {
      banco_id: novoBanco.id,
      nome: "Prioridade",
      tipo: "selecao",
      ordem: 1,
      configuracoes: { opcoes: ["Alta", "Média", "Baixa"] },
    },
    {
      banco_id: novoBanco.id,
      nome: "Data",
      tipo: "data",
      ordem: 2,
      configuracoes: { opcoes: [] },
    },
  ];

  await supabase.from("propriedades_banco").insert(propsPadrao);

  // 3. Criar registro de exemplo
  await supabase.from("registros_banco").insert({
    banco_id: novoBanco.id,
    criado_por: user.id,
    titulo: "Primeiro Registro de Exemplo",
    icone: "FileText",
    valores: {
      Status: "Em andamento",
      Prioridade: "Alta",
    },
    conteudo: [
      {
        tipo: "paragrafo",
        texto:
          "Este é um registro dinâmico. No VICCS Planner, cada linha da sua tabela também funciona como uma página completa com anotações e documentos.",
      },
    ],
    ordem: 0,
  });

  revalidatePath(`/${workspaceId}/bancos`);
  return { sucesso: true, banco: novoBanco };
}

/**
 * Adiciona uma nova propriedade/coluna dinâmica à base de dados.
 */
export async function adicionarPropriedadeAcao(
  bancoId: string,
  nome: string,
  tipo: PropriedadeBanco["tipo"],
  configuracoes: { opcoes?: string[] } = { opcoes: [] }
) {
  const supabase = await criarClienteServidor();

  // Obter contagem de propriedades para a ordem
  const { count } = await supabase
    .from("propriedades_banco")
    .select("*", { count: "exact", head: true })
    .eq("banco_id", bancoId);

  const { data, error } = await supabase
    .from("propriedades_banco")
    .insert({
      banco_id: bancoId,
      nome: nome.trim(),
      tipo,
      ordem: count || 0,
      configuracoes,
    })
    .select()
    .single();

  if (error) {
    console.error("[VICCS Planner] Erro ao adicionar propriedade:", error);
    return { sucesso: false, mensagem: "Erro ao adicionar coluna." };
  }

  return { sucesso: true, propriedade: data };
}

/**
 * Remove uma propriedade da base de dados.
 */
export async function removerPropriedadeAcao(
  propriedadeId: string,
  bancoId: string
) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("propriedades_banco")
    .delete()
    .eq("id", propriedadeId);

  if (error) {
    return { sucesso: false, mensagem: "Erro ao remover propriedade." };
  }

  return { sucesso: true };
}

/**
 * Cria um novo registro/linha na base de dados.
 */
export async function criarRegistroAcao(
  bancoId: string,
  titulo: string = "Novo item",
  valores: Record<string, any> = {}
) {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("registros_banco")
    .insert({
      banco_id: bancoId,
      criado_por: user?.id || null,
      titulo: titulo.trim() || "Item sem título",
      valores,
      conteudo: [],
      ordem: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("[VICCS Planner] Erro ao criar registro:", error);
    return { sucesso: false, mensagem: "Erro ao criar linha." };
  }

  return { sucesso: true, registro: data };
}

/**
 * Atualiza valores e título de um registro.
 */
export async function atualizarRegistroAcao(
  registroId: string,
  dados: {
    titulo?: string;
    valores?: Record<string, any>;
    icone?: string;
  }
) {
  const supabase = await criarClienteServidor();

  const payload: Record<string, any> = {};
  if (dados.titulo !== undefined) payload.titulo = dados.titulo;
  if (dados.valores !== undefined) payload.valores = dados.valores;
  if (dados.icone !== undefined) payload.icone = dados.icone;

  const { error } = await (supabase.from("registros_banco") as any)
    .update(payload)
    .eq("id", registroId);

  if (error) {
    console.error("[VICCS Planner] Erro ao atualizar registro:", error);
    return { sucesso: false, mensagem: "Erro ao salvar alterações." };
  }

  return { sucesso: true };
}

/**
 * Exclui um registro da base de dados.
 */
export async function deletarRegistroAcao(registroId: string) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("registros_banco")
    .delete()
    .eq("id", registroId);

  if (error) {
    return { sucesso: false, mensagem: "Erro ao excluir registro." };
  }

  return { sucesso: true };
}

/**
 * Salva o documento de blocos (Tiptap) da página interna do registro.
 */
export async function salvarConteudoRegistroAcao(
  registroId: string,
  conteudo: any
) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("registros_banco")
    .update({ conteudo })
    .eq("id", registroId);

  if (error) {
    return { sucesso: false, mensagem: "Erro ao salvar página do registro." };
  }

  return { sucesso: true };
}

/**
 * Métricas consolidadas para o Dashboard do Workspace.
 */
export async function obterMetricasWorkspaceAcao(workspaceId: string) {
  const supabase = await criarClienteServidor();

  // 1. Contagem de páginas
  const { count: totalPaginas } = await supabase
    .from("paginas")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("arquivada", false);

  // 2. Contagem de projetos
  const { count: totalProjetos } = await supabase
    .from("projetos")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("arquivado", false);

  // 3. Contagem de bases de dados
  const { count: totalBancos } = await supabase
    .from("bancos_dados")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  // 4. Contagem de membros
  const { count: totalMembros } = await supabase
    .from("membros_workspace")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  // 5. Total de tarefas no workspace através dos projetos
  const { data: projetos } = await supabase
    .from("projetos")
    .select("id")
    .eq("workspace_id", workspaceId);

  let tarefasConcluidas = 0;
  let tarefasPendentes = 0;

  if (projetos && projetos.length > 0) {
    const ids = projetos.map((p) => p.id);
    const { data: tarefas } = await (supabase.from("tarefas_kanban") as any)
      .select("id, coluna:colunas_kanban(nome)")
      .in("projeto_id", ids);

    if (tarefas) {
      for (const t of (tarefas as any[])) {
        const nomeColuna = (t.coluna as any)?.nome?.toLowerCase() || "";
        if (nomeColuna.includes("conclu") || nomeColuna.includes("done")) {
          tarefasConcluidas++;
        } else {
          tarefasPendentes++;
        }
      }
    }
  }

  return {
    totalPaginas: totalPaginas || 0,
    totalProjetos: totalProjetos || 0,
    totalBancos: totalBancos || 0,
    totalMembros: totalMembros || 0,
    tarefasConcluidas,
    tarefasPendentes,
    totalTarefas: tarefasConcluidas + tarefasPendentes,
  };
}
