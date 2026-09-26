"use client";

import * as React from "react";
import {
  Table,
  LayoutGrid,
  Search,
  Plus,
  Download,
  Database,
  ArrowLeft,
  Columns,
} from "lucide-react";
import Link from "next/link";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import type { BancoComDetalhes, PropriedadeBanco, RegistroBanco } from "@/lib/acoes/banco-dados-acoes";
import { TabelaBanco } from "./tabela-banco";
import { GaleriaBanco } from "./galeria-banco";
import { ModalAdicionarColuna } from "./modal-adicionar-coluna";
import { PainelRegistroDetalhes } from "./painel-registro-detalhes";

interface PropsVisualizadorBanco {
  bancoInicial: BancoComDetalhes;
  workspaceId: string;
}

export function VisualizadorBanco({
  bancoInicial,
  workspaceId,
}: PropsVisualizadorBanco) {
  const [visaoAtiva, setVisaoAtiva] = React.useState<"tabela" | "galeria">(
    bancoInicial.visao_padrao === "galeria" ? "galeria" : "tabela"
  );
  const [busca, setBusca] = React.useState("");
  const [propriedades, setPropriedades] = React.useState<PropriedadeBanco[]>(
    bancoInicial.propriedades
  );
  const [registros, setRegistros] = React.useState<RegistroBanco[]>(
    bancoInicial.registros
  );
  const [registroSelecionado, setRegistroSelecionado] =
    React.useState<RegistroBanco | null>(null);
  const [modalColunaAberto, setModalColunaAberto] = React.useState(false);

  // Adicionar coluna callback
  const aoAdicionarColuna = (novaPropriedade: PropriedadeBanco) => {
    setPropriedades([...propriedades, novaPropriedade]);
  };

  // Atualizar registro callback
  const aoAtualizarRegistro = (atualizado: RegistroBanco) => {
    setRegistros(
      registros.map((r) => (r.id === atualizado.id ? atualizado : r))
    );
    if (registroSelecionado?.id === atualizado.id) {
      setRegistroSelecionado(atualizado);
    }
  };

  const aoExcluirRegistro = (registroId: string) => {
    setRegistros(registros.filter((r) => r.id !== registroId));
    if (registroSelecionado?.id === registroId) {
      setRegistroSelecionado(null);
    }
  };

  // Exportar dados como CSV
  const aoExportarCSV = () => {
    const cabecalho = ["Título", ...propriedades.map((p) => p.nome)].join(",");
    const linhas = registros.map((r) => {
      const valoresCols = propriedades.map((p) => {
        const val = r.valores?.[p.nome] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      return [`"${r.titulo.replace(/"/g, '""')}"`, ...valoresCols].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [cabecalho, ...linhas].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${bancoInicial.nome || "banco-de-dados"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Navegação de retorno */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${workspaceId}/bancos`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar para todas as bases de dados</span>
        </Link>

        <Botao
          variante="secundario"
          tamanho="sm"
          onClick={aoExportarCSV}
          className="gap-1.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Exportar CSV</span>
        </Botao>
      </div>

      {/* Cabeçalho da Base de Dados */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[var(--raio-md)] bg-[var(--accent)]/10 text-[var(--accent)]">
            <Database className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {bancoInicial.nome}
          </h1>
        </div>
        {bancoInicial.descricao && (
          <p className="text-xs text-[var(--foreground-muted)] pl-10">
            {bancoInicial.descricao}
          </p>
        )}
      </div>

      {/* Barra de Ferramentas / Views */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-b border-[var(--border)] pb-3">
        {/* Alternador de Abas de Visualização */}
        <div className="flex items-center gap-1 bg-[var(--surface-elevada)]/60 p-1 rounded-[var(--raio-md)] border border-[var(--border)] w-fit">
          <button
            onClick={() => setVisaoAtiva("tabela")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--raio-sm)] text-xs font-semibold transition-all ${
              visaoAtiva === "tabela"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Tabela</span>
          </button>

          <button
            onClick={() => setVisaoAtiva("galeria")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--raio-sm)] text-xs font-semibold transition-all ${
              visaoAtiva === "galeria"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Galeria</span>
          </button>
        </div>

        {/* Busca e Ações Rápidas */}
        <div className="flex items-center gap-2">
          <div className="w-56">
            <Input
              type="text"
              placeholder="Filtrar registros..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              iconeEsquerda={<Search className="h-3.5 w-3.5" />}
              className="h-8 text-xs"
            />
          </div>

          <Botao
            variante="secundario"
            tamanho="sm"
            onClick={() => setModalColunaAberto(true)}
            className="gap-1.5"
          >
            <Columns className="h-3.5 w-3.5" />
            <span>+ Coluna</span>
          </Botao>
        </div>
      </div>

      {/* Visualização Ativa */}
      {visaoAtiva === "tabela" ? (
        <TabelaBanco
          bancoId={bancoInicial.id}
          propriedades={propriedades}
          registros={registros}
          termoBusca={busca}
          aoAbrirRegistro={(reg) => setRegistroSelecionado(reg)}
          aoAbrirModalColuna={() => setModalColunaAberto(true)}
          aoAtualizarRegistros={(novos) => setRegistros(novos)}
        />
      ) : (
        <GaleriaBanco
          bancoId={bancoInicial.id}
          propriedades={propriedades}
          registros={registros}
          termoBusca={busca}
          aoAbrirRegistro={(reg) => setRegistroSelecionado(reg)}
          aoAtualizarRegistros={(novos) => setRegistros(novos)}
        />
      )}

      {/* Modal Adicionar Coluna */}
      <ModalAdicionarColuna
        aberto={modalColunaAberto}
        aoFechar={() => setModalColunaAberto(false)}
        bancoId={bancoInicial.id}
        aoAdicionar={aoAdicionarColuna}
      />

      {/* Painel Lateral de Detalhes da Linha / Página do Registro */}
      <PainelRegistroDetalhes
        registro={registroSelecionado}
        propriedades={propriedades}
        bancoId={bancoInicial.id}
        aoFechar={() => setRegistroSelecionado(null)}
        aoAtualizar={aoAtualizarRegistro}
        aoExcluir={aoExcluirRegistro}
      />
    </div>
  );
}
