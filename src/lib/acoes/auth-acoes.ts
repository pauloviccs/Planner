"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  esquemaEntrar,
  esquemaCadastro,
  esquemaRecuperarSenha,
  esquemaRedefinirSenha,
  type TipoEntrar,
  type TipoCadastro,
} from "@/lib/validacoes/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface RespostaAcao {
  sucesso: boolean;
  mensagem?: string;
  erros?: Record<string, string[]>;
}

/**
 * Autentica o usuário utilizando e-mail e senha.
 */
export async function entrarAcao(dados: TipoEntrar): Promise<RespostaAcao> {
  const validacao = esquemaEntrar.safeParse(dados);
  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem: "Por favor, corrija os erros nos campos indicados.",
      erros: validacao.error.flatten().fieldErrors,
    };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: validacao.data.email,
    password: validacao.data.senha,
  });

  if (error) {
    let mensagemAmigavel = "Erro ao entrar na conta. Verifique suas credenciais.";
    if (error.message.includes("Invalid login credentials")) {
      mensagemAmigavel = "E-mail ou senha incorretos. Tente novamente.";
    } else if (error.message.includes("Email not confirmed")) {
      mensagemAmigavel = "Por favor, confirme seu endereço de e-mail antes de entrar.";
    }
    return {
      sucesso: false,
      mensagem: mensagemAmigavel,
    };
  }

  revalidatePath("/", "layout");
  return { sucesso: true };
}

/**
 * Cadastra um novo usuário no sistema.
 */
export async function cadastrarAcao(dados: TipoCadastro): Promise<RespostaAcao> {
  const validacao = esquemaCadastro.safeParse(dados);
  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem: "Por favor, corrija os dados informados.",
      erros: validacao.error.flatten().fieldErrors,
    };
  }

  const supabase = await criarClienteServidor();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data: authData, error } = await supabase.auth.signUp({
    email: validacao.data.email,
    password: validacao.data.senha,
    options: {
      emailRedirectTo: `${appUrl}/callback`,
      data: {
        nome_completo: validacao.data.nome_completo,
      },
    },
  });

  if (error) {
    let mensagemAmigavel = "Não foi possível concluir o cadastro.";
    if (error.message.includes("already registered")) {
      mensagemAmigavel = "Este e-mail já está em uso por outra conta.";
    }
    return {
      sucesso: false,
      mensagem: mensagemAmigavel,
    };
  }

  // Se a confirmação de e-mail for automática no Supabase ou já tiver sessão:
  if (authData.session) {
    revalidatePath("/", "layout");
    return {
      sucesso: true,
      mensagem: "Conta criada com sucesso!",
    };
  }

  return {
    sucesso: true,
    mensagem:
      "Cadastro realizado! Enviamos um link de confirmação para o seu e-mail.",
  };
}

/**
 * Envia um e-mail de recuperação de senha.
 */
export async function recuperarSenhaAcao(email: string): Promise<RespostaAcao> {
  const validacao = esquemaRecuperarSenha.safeParse({ email });
  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem: "Insira um endereço de e-mail válido.",
      erros: validacao.error.flatten().fieldErrors,
    };
  }

  const supabase = await criarClienteServidor();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(validacao.data.email, {
    redirectTo: `${appUrl}/recuperar/redefinir`,
  });

  if (error) {
    return {
      sucesso: false,
      mensagem: "Erro ao enviar link de recuperação. Tente novamente mais tarde.",
    };
  }

  return {
    sucesso: true,
    mensagem: "Link de recuperação enviado! Verifique sua caixa de entrada.",
  };
}

/**
 * Redefine a senha de um usuário autenticado via link de recuperação.
 */
export async function redefinirSenhaAcao(dados: {
  senha: string;
  confirmar_senha: string;
}): Promise<RespostaAcao> {
  const validacao = esquemaRedefinirSenha.safeParse(dados);
  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem: "Verifique os requisitos da nova senha.",
      erros: validacao.error.flatten().fieldErrors,
    };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.updateUser({
    password: validacao.data.senha,
  });

  if (error) {
    return {
      sucesso: false,
      mensagem: "Não foi possível atualizar a senha. Tente solicitar um novo link.",
    };
  }

  return {
    sucesso: true,
    mensagem: "Sua senha foi redefinida com sucesso!",
  };
}

/**
 * Encerra a sessão do usuário.
 */
export async function sairAcao() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/entrar");
}
