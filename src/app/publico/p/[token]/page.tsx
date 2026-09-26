import * as React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Globe, ArrowUpRight, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { obterPaginaPublica } from "@/lib/acoes/compartilhamento-acoes";
import { VisualizadorPaginaPublica } from "@/componentes/editor/visualizador-pagina-publica";
import { AlternadorTema } from "@/componentes/layout/alternador-tema";

interface PropriedadesPaginaPublica {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({ params }: PropriedadesPaginaPublica) {
  const { token } = await params;
  const pagina = await obterPaginaPublica(token);

  if (!pagina) {
    return {
      title: "Documento Não Encontrado — VICCS Planner",
    };
  }

  return {
    title: `${pagina.titulo} — VICCS Planner`,
    description: `Visualização pública do documento "${pagina.titulo}" no VICCS Planner.`,
  };
}

export default async function PaginaPublicaVisualizacao({
  params,
}: PropriedadesPaginaPublica) {
  const { token } = await params;
  const pagina = await obterPaginaPublica(token);

  if (!pagina) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Barra de Navegação Pública Superior */}
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
            <span>Público</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AlternadorTema />

          <Link
            href="/entrar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--raio-sm)] text-xs font-semibold bg-[var(--accent)] text-white hover:brightness-110 transition-all shadow-xs"
          >
            <span>Criar meu workspace</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Conteúdo do Documento */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <article className="superficie-glass rounded-[var(--raio-lg)] border border-[var(--border)] p-6 sm:p-10 shadow-lg space-y-6">
          {/* Cabeçalho do Documento */}
          <div className="space-y-3 pb-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)] text-[var(--accent)]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                  {pagina.titulo}
                </h1>
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Atualizado em{" "}
                  {format(new Date(pagina.atualizado_em), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Renderização do Corpo do Documento */}
          <div className="pt-2">
            <VisualizadorPaginaPublica conteudo={pagina.conteudo} />
          </div>
        </article>
      </main>

      {/* Rodapé */}
      <footer className="py-6 border-t border-[var(--border)] text-center text-xs text-[var(--foreground-muted)]">
        <p>Publicado com VICCS Planner — Notion + Trello unificados em um workspace colaborativo.</p>
      </footer>
    </div>
  );
}
