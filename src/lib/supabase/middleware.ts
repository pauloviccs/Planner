import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function atualizarSessao(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[VICCS Planner] Atenção: NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY não estão definidas no ambiente."
    )
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
