import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { obterPaginaPorId } from "@/lib/acoes/pagina-acoes";
import { EditorPrincipal } from "@/componentes/editor/editor-principal";
import { ModalCompartilhar } from "@/componentes/compartilhamento/modal-compartilhar";

interface PropriedadesPaginaDetalhe {
  params: Promise<{
    workspaceId: string;
    paginaId: string;
  }>;
}

export default async function PaginaEditorDetalhe({
  params,
}: PropriedadesPaginaDetalhe) {
  const { workspaceId, paginaId } = await params;
  const pagina = await obterPaginaPorId(paginaId);

  if (!pagina) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl pb-16">
      {/* Navegação de volta e Compartilhamento */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/${workspaceId}/paginas`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar para todas as páginas</span>
        </Link>

        <ModalCompartilhar
          id={pagina.id}
          tipo="pagina"
          titulo={pagina.titulo}
          publicoInicial={Boolean(pagina.publico)}
          tokenPublicoInicial={pagina.token_publico}
        />
      </div>

      <EditorPrincipal
        paginaId={pagina.id}
        workspaceId={workspaceId}
        tituloInicial={pagina.titulo}
        conteudoInicial={pagina.conteudo}
        favoritaInicial={pagina.favorita}
      />
    </div>
  );
}
