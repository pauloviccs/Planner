"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  esquemaCriarWorkspace,
  esquemaAtualizarWorkspace,
  type TipoCriarWorkspace,
  type TipoAtualizarWorkspace,
} from "@/lib/validacoes/workspace";
import { gerarSlug } from "@/lib/utilitarios";
import { revalidatePath } from "next/cache";

export interface WorkspaceComPapel {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  icone_url: string | null;
  tipo: "pessoal" | "equipe";
  papel: "proprietario" | "admin" | "membro" | "convidado";
  criado_em: string;
}

/**
 * Retorna todos os workspaces nos quais o usuário autenticado é membro.
 */
export async function obterWorkspacesDoUsuario(): Promise<WorkspaceComPapel[]> {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("membros_workspace")
    .select(`
      papel,
      workspace:workspaces (
        id,
        nome,
        slug,
        descricao,
        icone_url,
        tipo,
        criado_em
      )
    `)
    .eq("usuario_id", user.id)
    .order("criado_em", { ascending: true });

  if (error || !data) return [];

  // Mapeia e normaliza os registros retornados
  const workspaces: WorkspaceComPapel[] = [];
  for (const item of data) {
    const ws = item.workspace as unknown as {
      id: string;
      nome: string;
      slug: string;
      descricao: string | null;
      icone_url: string | null;
      tipo: "pessoal" | "equipe";
      criado_em: string;
    };
    if (ws) {
      workspaces.push({
        id: ws.id,
        nome: ws.nome,
        slug: ws.slug,
        descricao: ws.descricao,
        icone_url: ws.icone_url,
        tipo: ws.tipo,
        papel: item.papel,
        criado_em: ws.criado_em,
      });
    }
  }

  return workspaces;
}

/**
 * Cria um novo workspace e vincula o usuário como proprietário.
 */
export async function criarWorkspaceAcao(dados: TipoCriarWorkspace) {
  const validacao = esquemaCriarWorkspace.safeParse(dados);
  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem: "Dados inválidos para o workspace.",
      erros: validacao.error.flatten().fieldErrors,
    };
  }

  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { sucesso: false, mensagem: "Usuário não autenticado." };
  }

  // Gera slug único com sufixo randômico de 4 caracteres
  const sufixo = Math.random().toString(36).substring(2, 6);
  const slug = `${gerarSlug(validacao.data.nome)}-${sufixo}`;

  // 1. Cria workspace
  const { data: workspaceCriado, error: erroWs } = await supabase
    .from("workspaces")
    .insert({
      nome: validacao.data.nome,
      slug,
      descricao: validacao.data.descricao || "",
      tipo: validacao.data.tipo,
      criado_por: user.id,
    })
    .select()
    .single();

  if (erroWs || !workspaceCriado) {
    console.error("[VICCS Planner] Erro ao criar workspace:", erroWs);
    const mensagemErro =
      erroWs?.code === "PGRST205"
        ? "Tabelas não encontradas no Supabase. É necessário rodar o arquivo de migração SQL (00001_esquema_fase1.sql) no SQL Editor do Supabase."
        : erroWs?.message || "Não foi possível criar o workspace no banco de dados.";
    return {
      sucesso: false,
      mensagem: mensagemErro,
    };
  }

  // 2. Garante associação do membro como proprietário
  await supabase.from("membros_workspace").upsert(
    {
      workspace_id: workspaceCriado.id,
      usuario_id: user.id,
      papel: "proprietario",
    },
    { onConflict: "workspace_id,usuario_id" }
  );

  // 3. Cria uma página de boas-vindas padrão ("Comece por aqui")
  await supabase.from("paginas").insert({
    workspace_id: workspaceCriado.id,
    criado_por: user.id,
    titulo: "Comece por aqui",
    icone: "Sparkles",
    conteudo: [
      {
        tipo: "paragrafo",
        texto: "Bem-vindo ao seu novo workspace no VICCS Planner! Aqui você pode documentar ideias, organizar projetos e gerenciar tarefas em um só lugar.",
      },
      {
        tipo: "checklist",
        texto: "Criar minha primeira página de anotações",
        concluido: false,
      },
      {
        tipo: "checklist",
        texto: "Criar um projeto com quadro Kanban",
        concluido: false,
      },
      {
        tipo: "checklist",
        texto: "Personalizar as configurações do workspace",
        concluido: false,
      },
    ],
    posicao: 0,
    favorita: true,
  });

  // 4. Cria um projeto padrão com quadro e colunas
  const { data: projetoPadrao } = await supabase
    .from("projetos")
    .insert({
      workspace_id: workspaceCriado.id,
      criado_por: user.id,
      nome: "Meu Primeiro Projeto",
      descricao: "Acompanhe as principais tarefas e entregas.",
      cor: "#3b82f6",
      icone: "Kanban",
    })
    .select()
    .single();

  if (projetoPadrao) {
    const { data: quadroPadrao } = await supabase
      .from("quadros")
      .insert({
        projeto_id: projetoPadrao.id,
        workspace_id: workspaceCriado.id,
        nome: "Quadro de Atividades",
        posicao: 0,
      })
      .select()
      .single();

    if (quadroPadrao) {
      await supabase.from("colunas").insert([
        { quadro_id: quadroPadrao.id, titulo: "A Fazer", cor: "#64748b", posicao: 0 },
        { quadro_id: quadroPadrao.id, titulo: "Em Andamento", cor: "#3b82f6", posicao: 1 },
        { quadro_id: quadroPadrao.id, titulo: "Concluído", cor: "#10b981", posicao: 2 },
      ]);
    }
  }

  revalidatePath("/", "layout");
  return {
    sucesso: true,
    workspace: workspaceCriado,
  };
}

/**
 * Garante que o usuário possua ao menos um workspace ativo.
 * Caso não possua nenhum, gera automaticamente um inicial pessoal.
 */
export async function garantirWorkspaceUsuario(): Promise<string | null> {
  const workspaces = await obterWorkspacesDoUsuario();
  if (workspaces.length > 0) {
    return workspaces[0].id;
  }

  // Cria um workspace padrão automático
  const resultado = await criarWorkspaceAcao({
    nome: "Workspace Pessoal",
    descricao: "Meu espaço pessoal de trabalho e organização.",
    tipo: "pessoal",
  });

  if (resultado.sucesso && resultado.workspace) {
    return resultado.workspace.id;
  }

  return null;
}

/**
 * Retorna o papel do usuário autenticado no workspace informado.
 */
export async function obterPapelUsuarioWorkspace(
  workspaceId: string
): Promise<"proprietario" | "admin" | "membro" | "convidado" | null> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("membros_workspace")
    .select("papel")
    .eq("workspace_id", workspaceId)
    .eq("usuario_id", user.id)
    .single();

  return (data?.papel as "proprietario" | "admin" | "membro" | "convidado") || null;
}

/**
 * Atualiza os dados de um workspace existente.
 * Apenas proprietários e administradores podem atualizar.
 */
export async function atualizarWorkspaceAcao(
  workspaceId: string,
  dados: TipoAtualizarWorkspace
): Promise<{
  sucesso: boolean;
  mensagem?: string;
  workspace?: {
    id: string;
    nome: string;
    slug: string;
    descricao: string | null;
    tipo: "pessoal" | "equipe";
    icone_url: string | null;
  };
}> {
  const validacao = esquemaAtualizarWorkspace.safeParse(dados);
  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem: validacao.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { sucesso: false, mensagem: "Usuário não autenticado." };
  }

  // Verifica permissão (admin ou proprietário)
  const { data: membro } = await supabase
    .from("membros_workspace")
    .select("papel")
    .eq("workspace_id", workspaceId)
    .eq("usuario_id", user.id)
    .single();

  if (!membro || !["proprietario", "admin"].includes(membro.papel)) {
    return {
      sucesso: false,
      mensagem:
        "Permissão insuficiente. Apenas administradores ou o proprietário podem editar o workspace.",
    };
  }

  const camposAtualizar: {
    nome?: string;
    descricao?: string | null;
    tipo?: "pessoal" | "equipe";
    icone_url?: string | null;
  } = {};
  if (validacao.data.nome !== undefined) {
    camposAtualizar.nome = validacao.data.nome;
  }
  if (validacao.data.descricao !== undefined) {
    camposAtualizar.descricao = validacao.data.descricao;
  }
  if (validacao.data.tipo !== undefined) {
    camposAtualizar.tipo = validacao.data.tipo;
  }
  if (validacao.data.icone_url !== undefined) {
    camposAtualizar.icone_url = validacao.data.icone_url;
  }

  const { data: wsAtualizado, error } = await supabase
    .from("workspaces")
    .update(camposAtualizar)
    .eq("id", workspaceId)
    .select()
    .single();

  if (error || !wsAtualizado) {
    console.error("[VICCS Planner] Erro ao atualizar workspace:", error);
    return {
      sucesso: false,
      mensagem: error?.message || "Não foi possível atualizar o workspace.",
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/selecionar-workspace");
  revalidatePath(`/${workspaceId}`, "layout");
  revalidatePath(`/${workspaceId}/configuracoes`);

  return {
    sucesso: true,
    workspace: wsAtualizado,
  };
}

/**
 * Exclui permanentemente um workspace e todos os seus dados dependentes.
 * Apenas o proprietário pode excluir o workspace.
 * Garante que se o usuário ficar sem nenhum workspace, um novo pessoal seja gerado.
 */
export async function deletarWorkspaceAcao(
  workspaceId: string
): Promise<{
  sucesso: boolean;
  mensagem?: string;
  proximoWorkspaceId?: string;
}> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { sucesso: false, mensagem: "Usuário não autenticado." };
  }

  // Verifica se o usuário é o proprietário
  const { data: membro } = await supabase
    .from("membros_workspace")
    .select("papel")
    .eq("workspace_id", workspaceId)
    .eq("usuario_id", user.id)
    .single();

  if (!membro || membro.papel !== "proprietario") {
    return {
      sucesso: false,
      mensagem:
        "Apenas o proprietário do workspace tem permissão para excluí-lo permanentemente.",
    };
  }

  // Deleta o workspace (o banco faz cascade para projetos, páginas, quadros, etc.)
  const { error: erroDelete } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (erroDelete) {
    console.error("[VICCS Planner] Erro ao deletar workspace:", erroDelete);
    return {
      sucesso: false,
      mensagem: erroDelete.message || "Não foi possível excluir o workspace.",
    };
  }

  // Busca se o usuário possui outros workspaces para onde redirecionar
  const outrosWorkspaces = await obterWorkspacesDoUsuario();
  let proximoWorkspaceId: string | undefined = undefined;

  if (outrosWorkspaces.length > 0) {
    proximoWorkspaceId = outrosWorkspaces[0].id;
  } else {
    // Garante criação de novo workspace pessoal caso tenha deletado o único
    const novoWsId = await garantirWorkspaceUsuario();
    if (novoWsId) {
      proximoWorkspaceId = novoWsId;
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/selecionar-workspace");

  return {
    sucesso: true,
    proximoWorkspaceId,
  };
}
