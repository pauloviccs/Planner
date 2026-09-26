import * as React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FolderKanban, Globe, ArrowUpRight, Sparkles } from "lucide-react";
import { obterProjetoPublico } from "@/lib/acoes/compartilhamento-acoes";
import { VisualizadorProjetoPublico } from "@/componentes/compartilhamento/visualizador-projeto-publico";
import { AlternadorTema } from "@/componentes/layout/alternador-tema";

interface PropriedadesPaginaProjetoPublico {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({
  params,
}: PropriedadesPaginaProjetoPublico) {
  const { token } = await params;
  const dados = await obterProjetoPublico(token);

  if (!dados) {
    return {
      title: "Projeto Não Encontrado — VICCS Planner",
    };
  }

  return {
    title: `${dados.projeto.nome} — Quadro Público | VICCS Planner`,
    description: dados.projeto.descricao || `Visualização pública do projeto "${dados.projeto.nome}" no VICCS Planner.`,
  };
}

export default async function PaginaProjetoPublico({
  params,
}: PropriedadesPaginaProjetoPublico) {
  const { token } = await params;
  const dados = await obterProjetoPublico(token);

  if (!dados) {
    notFound();
  }

  const { projeto, colunas } = dados;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Barra Superior Pública */}
      <header className="superficie-glass sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-sm tracking-tight text-[var(--foreground)] hover:opacity-80 transition-opacity"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-[var(--raio-sm)] bg-[var(--accent)] text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>VICCS Planner</span>
          </Link>

          <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Globe className="h-3 w-3" />
            <span>Quadro Público</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AlternadorTema />

          <Link
            href="/entrar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--raio-sm)] text-xs font-semibold bg-[var(--accent)] text-white hover:brightness-110 transition-all shadow-xs"
          >
            <span>Entrar / Cadastrar</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Cabeçalho do Projeto */}
        <div className="superficie-glass p-6 rounded-[var(--raio-lg)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[var(--raio-md)] text-white shadow-md"
              style={{ backgroundColor: projeto.cor }}
            >
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                {projeto.nome}
              </h1>
              {projeto.descricao && (
                <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1">
                  {projeto.descricao}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Visualizador do Quadro */}
        <VisualizadorProjetoPublico
          projeto={projeto}
          colunas={colunas as any}
        />
      </main>

      {/* Rodapé */}
      <footer className="py-6 border-t border-[var(--border)] text-center text-xs text-[var(--foreground-muted)]">
        <p>Publicado com VICCS Planner — Workspace de Produtividade em Tempo Real.</p>
      </footer>
    </div>
  );
}
