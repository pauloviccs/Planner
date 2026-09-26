import * as React from "react";
import { notFound } from "next/navigation";
import { obterBancoComDetalhes } from "@/lib/acoes/banco-dados-acoes";
import { VisualizadorBanco } from "@/componentes/bancos/visualizador-banco";

interface PropriedadesPaginaBancoDetalhes {
  params: Promise<{
    workspaceId: string;
    bancoId: string;
  }>;
}

export default async function PaginaBancoDetalhes({
  params,
}: PropriedadesPaginaBancoDetalhes) {
  const { workspaceId, bancoId } = await params;
  const banco = await obterBancoComDetalhes(bancoId);

  if (!banco) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4">
      <VisualizadorBanco bancoInicial={banco} workspaceId={workspaceId} />
    </div>
  );
}
