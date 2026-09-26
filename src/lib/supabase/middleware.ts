import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function atualizarSessao(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: Não colocar lógica entre createServerClient e getUser().
  // Um simples engano pode causar bugs difíceis de depurar.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rotas de autenticação (redireciona para workspace se já autenticado)
  const rotasAuth = ["/entrar", "/cadastro", "/recuperar"]
  const ehRotaAuth = rotasAuth.some((rota) =>
    request.nextUrl.pathname.startsWith(rota)
  )

  // Rotas públicas que não exigem login (inclui compartilhamento /publico)
  const rotasPublicas = ["/entrar", "/cadastro", "/recuperar", "/callback", "/publico"]
  const ehRotaPublica = rotasPublicas.some((rota) =>
    request.nextUrl.pathname.startsWith(rota)
  )

  // Se não está autenticado e não está em rota pública, redirecionar para login
  if (!user && !ehRotaPublica && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/entrar"
    return NextResponse.redirect(url)
  }

  // Se está autenticado e está tentando acessar tela de login/cadastro, redirecionar para o app
  if (user && ehRotaAuth) {
    const url = request.nextUrl.clone()
    url.pathname = "/selecionar-workspace"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
