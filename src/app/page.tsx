import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  FolderKanban,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Shield,
  Layers,
} from "lucide-react";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  obterWorkspacesDoUsuario,
  garantirWorkspaceUsuario,
} from "@/lib/acoes/workspace-acoes";
import { AlternadorTema } from "@/componentes/layout/alternador-tema";

export default async function PaginaRaiz() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se o usuário estiver autenticado, redireciona para seu workspace ativo
  if (user) {
    const workspaces = await obterWorkspacesDoUsuario();
    if (workspaces.length > 0) {
      redirect(`/${workspaces[0].id}`);
    }
    const novoWsId = await garantirWorkspaceUsuario();
    if (novoWsId) {
      redirect(`/${novoWsId}`);
    }
    redirect("/selecionar-workspace");
  }

  // Se não estiver logado, renderiza a Landing Page moderna com Glassmorphism
  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-white">
      {/* Luz ambiente de fundo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[var(--accent)]/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Topbar Institucional */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border)]"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-[var(--foreground)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--raio-md)] bg-[var(--accent)] text-white shadow-sm">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <span>VICCS Planner</span>
        </div>

        <div className="flex items-center gap-3">
          <AlternadorTema />
          <Link
            href="/entrar"
            className="text-xs font-semibold px-3 py-1.5 rounded-[var(--raio-md)] hover:bg-[var(--surface-elevada)] transition-colors text-[var(--foreground)]"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-[var(--raio-md)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm transition-all"
          >
            Cadastrar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>O melhor do Notion e Trello em um só lugar</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.15]">
          Produtividade com clareza,{" "}
          <span className="text-[var(--accent)]">sem complexidade</span>.
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[var(--foreground-muted)] max-w-2xl leading-relaxed">
          Crie notas dinâmicas em blocos, monte especificações completas e acompanhe suas entregas com quadros Kanban visuais de alta performance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/cadastro"
            className="flex items-center gap-2 px-6 py-3 rounded-[var(--raio-md)] bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] shadow-[var(--sombra-md)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Começar Agora Gratuitamente</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/entrar"
            className="flex items-center gap-2 px-6 py-3 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)] text-sm font-semibold text-[var(--foreground)] hover:border-[var(--border-hover)] transition-all"
          >
            <span>Já tenho uma conta</span>
          </Link>
        </div>

        {/* Feature Cards com Glassmorphism */}
        <div className="grid gap-4 sm:grid-cols-3 w-full pt-12 text-left">
          <div className="superficie-glass p-5 rounded-[var(--raio-lg)] border border-[var(--border)] space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--raio-sm)] bg-[var(--accent)]/15 text-[var(--accent)]">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Editor em Blocos
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              Escreva notas, wikis e especificações ricas com suporte a checklists, títulos e blocos de código.
            </p>
          </div>

          <div className="superficie-glass p-5 rounded-[var(--raio-lg)] border border-[var(--border)] space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--raio-sm)] bg-purple-500/15 text-purple-400">
              <FolderKanban className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Quadros Kanban Visuais
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              Organize tarefas em colunas, defina prioridades, datas de vencimento e sub-tarefas com facilidade.
            </p>
          </div>

          <div className="superficie-glass p-5 rounded-[var(--raio-lg)] border border-[var(--border)] space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--raio-sm)] bg-emerald-500/15 text-emerald-400">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Segurança e Isolamento
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              Isolamento completo entre workspaces com autenticação e políticas de segurança Row Level Security (RLS).
            </p>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer
        className="relative z-10 py-6 text-center text-xs text-[var(--foreground-muted)] border-t border-[var(--border)]"
        suppressHydrationWarning
      >
        <span>© {new Date().getFullYear()} VICCS Planner. Feito com foco em design e performance.</span>
      </footer>
    </div>
  );
}
