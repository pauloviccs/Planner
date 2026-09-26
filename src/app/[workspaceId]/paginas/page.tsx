import * as React from "react";
import Link from "next/link";
import { FileText, Star, Clock, Trash2, ArrowUpRight } from "lucide-react";
import { obterPaginasDoWorkspace } from "@/lib/acoes/pagina-acoes";
import { formatarTempoRelativo } from "@/lib/utilitarios";
import { BotaoCriarPaginaRapida } from "../botao-criar-pagina-rapida";

interface PropriedadesPaginasWorkspace {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function PaginaListaDocumentos({
  params,
}: PropriedadesPaginasWorkspace) {
  const { workspaceId } = await params;
  const paginas = await obterPaginasDoWorkspace(workspaceId);

  const baseHref = `/${workspaceId}`;
  const favoritas = paginas.filter((p) => p.favorita);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Documentos & Páginas
          </h1>
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            Notas, especificações, manuais e documentações em blocos.
          </p>
        </div>
        <BotaoCriarPaginaRapida workspaceId={workspaceId} variante="botao" />
      </div>

      {/* Páginas Favoritas se houver */}
      {favoritas.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-sutil)] flex items-center gap-1.5 px-1">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
            Favoritas ({favoritas.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favoritas.map((p) => (
              <Link
                key={p.id}
                href={`${baseHref}/paginas/${p.id}`}
                className="superficie-glass p-4 rounded-[var(--raio-md)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:scale-[1.01] flex flex-col justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--raio-sm)] bg-[var(--surface-elevada)] text-[var(--foreground)] border border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                      {p.titulo || "Sem título"}
                    </h3>
                    <span className="text-[11px] text-[var(--foreground-sutil)] flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatarTempoRelativo(p.atualizado_em)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Todas as Páginas */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-sutil)] px-1">
          Todas as Páginas ({paginas.length})
        </h2>

        {paginas.length === 0 ? (
          <div className="superficie-glass p-12 rounded-[var(--raio-lg)] text-center border border-[var(--border)]">
            <FileText className="h-10 w-10 mx-auto text-[var(--foreground-sutil)] mb-3" />
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Você ainda não tem páginas neste workspace
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto mt-1 mb-6">
              Comece agora mesmo criando sua primeira nota ou documentação em formato Notion.
            </p>
            <BotaoCriarPaginaRapida workspaceId={workspaceId} variante="botao" />
          </div>
        ) : (
          <div className="superficie-glass rounded-[var(--raio-lg)] border border-[var(--border)] overflow-hidden">
            <div className="divide-y divide-[var(--border)]">
              {paginas.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 hover:bg-[var(--surface-elevada)]/50 transition-colors group"
                >
                  <Link
                    href={`${baseHref}/paginas/${p.id}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--raio-sm)] bg-[var(--surface-elevada)] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] transition-colors">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                        {p.titulo || "Sem título"}
                      </h3>
                    </div>
                  </Link>

                  <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                    <span className="hidden sm:inline">
                      Atualizado {formatarTempoRelativo(p.atualizado_em)}
                    </span>
                    <Link
                      href={`${baseHref}/paginas/${p.id}`}
                      className="p-1 rounded hover:bg-[var(--surface-elevada)] text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
                      title="Abrir página"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
