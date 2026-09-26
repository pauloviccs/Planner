import { criarClienteServidor } from "@/lib/supabase/servidor";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const proximo = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await criarClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${proximo}`);
    }
  }

  // Redireciona com erro se o código for inválido ou expirado
  return NextResponse.redirect(`${origin}/entrar?erro=codigo_invalido`);
}
