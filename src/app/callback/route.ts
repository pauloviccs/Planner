import { criarClienteServidor } from "@/lib/supabase/servidor";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const proximo = searchParams.get("next") ?? "/";
  const erroParam = searchParams.get("error");
  const erroDescricao = searchParams.get("error_description");

  const supabase = await criarClienteServidor();

  // 1. Suporte a OTP via token_hash e type (formato padrão de links de e-mail do Supabase)
  if (tokenHash && type) {
    const { error: erroOtp } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!erroOtp) {
      return NextResponse.redirect(`${origin}${proximo}`);
    }

    console.warn("[VICCS Planner Callback] Falha no verifyOtp:", erroOtp.message);
  }

  // 2. Suporte a PKCE via code (exchangeCodeForSession)
  if (code) {
    const { error: erroCode } = await supabase.auth.exchangeCodeForSession(code);
    if (!erroCode) {
      return NextResponse.redirect(`${origin}${proximo}`);
    }

    console.warn("[VICCS Planner Callback] Falha no exchangeCodeForSession:", erroCode.message);
  }

  // 3. Verificar se o usuário já possui sessão ativa nos cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.redirect(`${origin}${proximo}`);
  }

  // 4. Se o link já foi pré-carregado/verificado pelo leitor de e-mail ou antivírus:
  // O e-mail foi de fato confirmado no Supabase, mas o código de uso único já foi consumido.
  // Em vez de punir o usuário com mensagem de erro vermelha, exibimos mensagem verde de sucesso!
  if (
    erroDescricao?.toLowerCase().includes("expired") ||
    erroDescricao?.toLowerCase().includes("already") ||
    erroParam === "otp_expired" ||
    code ||
    tokenHash
  ) {
    const mensagemSucesso = encodeURIComponent(
      "E-mail verificado com sucesso! Entre com sua senha para acessar seu workspace."
    );
    return NextResponse.redirect(`${origin}/entrar?mensagem=${mensagemSucesso}`);
  }

  // 5. Caso de erro genérico
  const mensagemErro = encodeURIComponent(
    erroDescricao || "O link acessado é inválido ou expirou. Tente entrar com suas credenciais."
  );
  return NextResponse.redirect(`${origin}/entrar?erro=${mensagemErro}`);
}
