import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FolderKanban } from "lucide-react";
import {
  obterProjetoPorId,
  obterQuadroCompleto,
} from "@/lib/acoes/projeto-acoes";
import { VisualizadorProjeto } from "@/componentes/quadro/visualizador-projeto";
import { ModalCompartilhar } from "@/componentes/compartilhamento/modal-compartilhar";
import { criarClienteServidor } from "@/lib/supabase/servidor";

interface PropriedadesPaginaProjeto {
  params: Promise<{
    workspaceId: string;
    projetoId: string;
  }>;
}

export default async function PaginaVisualizarProjeto({
  params,
}: PropriedadesPaginaProjeto) {
  const { workspaceId, projetoId } = await params;
  const projeto = await obterProjetoPorId(projetoId);

  if (!projeto) {
    notFound();
  }

  // Busca o quadro principal vinculado ao projeto
  const supabase = await criarClienteServidor();
  let { data: quadro } = await supabase
    .from("quadros")
    .select("id")
    .eq("projeto_id", projetoId)
    .order("posicao", { ascending: true })
    .limit(1)
    .single();

  // Se não existir quadro para este projeto, cria um sob demanda
  if (!quadro) {
    const { data: novoQuadro } = await supabase
      .from("quadros")
      .insert({
        projeto_id: projetoId,
        workspace_id: workspaceId,
        nome: "Quadro de Atividades",
        posicao: 0,
      })
      .select("id")
      .single();

    if (novoQuadro) {
      await supabase.from("colunas").insert([
        { quadro_id: novoQuadro.id, titulo: "A Fazer", cor: "#64748b", posicao: 0 },
        { quadro_id: novoQuadro.id, titulo: "Em Andamento", cor: "#3b82f6", posicao: 1 },
        { quadro_id: novoQuadro.id, titulo: "Concluído", cor: "#10b981", posicao: 2 },
      ]);
      quadro = novoQuadro;
    }
  }

  const quadroDetalhe = quadro ? await obterQuadroCompleto(quadro.id) : null;

  return (
    <div className="flex flex-col h-full space-y-4 pb-12">
      {/* Cabeçalho do Projeto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
        <div>
          <Link
            href={`/${workspaceId}/projetos`}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para projetos</span>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[var(--raio-sm)] text-white shadow-sm"
              style={{ backgroundColor: projeto.cor }}
              suppressHydrationWarning
            >
              <FolderKanban className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                {projeto.nome}
              </h1>
              {projeto.descricao && (
                <p className="text-xs text-[var(--foreground-muted)]">
                  {projeto.descricao}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ações do Cabeçalho: Compartilhar na Web */}
        <div className="flex items-center gap-2">
          <ModalCompartilhar
            id={projeto.id}
            tipo="projeto"
            titulo={projeto.nome}
            publicoInicial={Boolean(projeto.publico)}
            tokenPublicoInicial={projeto.token_publico}
          />
        </div>
      </div>

      {/* Visualizador Multivisão (Kanban, Tabela, Calendário) */}
      {quadroDetalhe ? (
        <VisualizadorProjeto quadro={quadroDetalhe} workspaceId={workspaceId} />
      ) : (
        <div className="superficie-glass p-8 rounded text-center text-sm text-[var(--foreground-muted)]">
          Carregando projeto...
        </div>
      )}
    </div>
  );
}
