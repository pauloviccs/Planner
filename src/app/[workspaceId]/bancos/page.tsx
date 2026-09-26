import * as React from "react";
import Link from "next/link";
import { Database, Plus, Table, LayoutGrid, Clock, ArrowRight } from "lucide-react";
import { obterBancosWorkspace } from "@/lib/acoes/banco-dados-acoes";
import { FormularioCriarBanco } from "@/componentes/bancos/formulario-criar-banco";
import { formatarDistanciaTempo } from "@/lib/utilitarios";

interface PropriedadesPaginaBancos {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function PaginaBancosWorkspace({
  params,
}: PropriedadesPaginaBancos) {
  const { workspaceId } = await params;
  const bancos = await obterBancosWorkspace(workspaceId);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
            <Database className="h-6 w-6 text-[var(--accent)]" />
            <span>Bases de Dados Dinâmicas</span>
          </h1>
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            Crie tabelas flexíveis com propriedades tipadas estilo Notion, onde cada registro também é uma página completa.
          </p>
        </div>

        <FormularioCriarBanco workspaceId={workspaceId} />
      </div>

      {/* Lista de Bases */}
      {bancos.length === 0 ? (
        <div className="superficie-glass border border-[var(--border)] rounded-[var(--raio-xl)] p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="p-3 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] w-fit mx-auto">
            <Database className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Nenhuma base de dados ainda
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1 max-w-sm mx-auto leading-relaxed">
              Organize seus dados estruturados, catálogos, listas de clientes, roadmaps e muito mais com propriedades dinâmicas.
            </p>
          </div>
          <div className="pt-2">
            <FormularioCriarBanco workspaceId={workspaceId} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {bancos.map((banco) => {
            return (
              <Link
                key={banco.id}
                href={`/${workspaceId}/bancos/${banco.id}`}
                className="group superficie-glass border border-[var(--border)] rounded-[var(--raio-lg)] p-5 hover:border-[var(--accent)] hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                      <Database className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] text-[var(--foreground-sutil)] uppercase font-semibold">
                      {banco.visao_padrao}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {banco.nome}
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {banco.descricao || "Sem descrição informada."}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border)]/40 mt-5 flex items-center justify-between text-[11px] text-[var(--foreground-sutil)]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatarDistanciaTempo(banco.atualizado_em)}
                  </span>
                  <span className="text-[var(--accent)] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Acessar</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
