"use client";

import * as React from "react";
import {
  X,
  Trash2,
  Calendar,
  Tag,
  CheckCircle2,
  Hash,
  Type,
  CheckSquare,
  Mail,
  Link as LinkIcon,
  Clock,
  Sparkles,
  FileText,
} from "lucide-react";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";
import type { PropriedadeBanco, RegistroBanco } from "@/lib/acoes/banco-dados-acoes";
import {
  atualizarRegistroAcao,
  deletarRegistroAcao,
  salvarConteudoRegistroAcao,
} from "@/lib/acoes/banco-dados-acoes";

interface PropsPainelRegistroDetalhes {
  registro: RegistroBanco | null;
  propriedades: PropriedadeBanco[];
  bancoId: string;
  aoFechar: () => void;
  aoAtualizar: (registroAtualizado: RegistroBanco) => void;
  aoExcluir: (registroId: string) => void;
}

export function PainelRegistroDetalhes({
  registro,
  propriedades,
  bancoId,
  aoFechar,
  aoAtualizar,
  aoExcluir,
}: PropsPainelRegistroDetalhes) {
  if (!registro) return null;

  const [titulo, setTitulo] = React.useState(registro.titulo);
  const [valores, setValores] = React.useState<Record<string, any>>(registro.valores || {});
  const [textoNota, setTextoNota] = React.useState(
    Array.isArray(registro.conteudo) && registro.conteudo.length > 0
      ? registro.conteudo.map((c: any) => c.texto || "").join("\n\n")
      : ""
  );
  const [salvandoStatus, setSalvandoStatus] = React.useState<"salvo" | "salvando" | "erro">("salvo");

  // Atualiza campo específico de propriedade
  const aoAlterarValor = async (nomePropriedade: string, novoValor: any) => {
    const novosValores = { ...valores, [nomePropriedade]: novoValor };
    setValores(novosValores);
    setSalvandoStatus("salvando");

    try {
      const res = await atualizarRegistroAcao(registro.id, {
        valores: novosValores,
      });
      if (res.sucesso) {
        setSalvandoStatus("salvo");
        aoAtualizar({ ...registro, valores: novosValores });
      } else {
        setSalvandoStatus("erro");
      }
    } catch {
      setSalvandoStatus("erro");
    }
  };

  // Salva o título ao perder o foco
  const aoSalvarTitulo = async () => {
    if (titulo === registro.titulo) return;
    setSalvandoStatus("salvando");

    try {
      const res = await atualizarRegistroAcao(registro.id, { titulo });
      if (res.sucesso) {
        setSalvandoStatus("salvo");
        aoAtualizar({ ...registro, titulo });
      } else {
        setSalvandoStatus("erro");
      }
    } catch {
      setSalvandoStatus("erro");
    }
  };

  // Salva as notas de texto do registro
  const aoSalvarNota = async () => {
    setSalvandoStatus("salvando");
    const blocos = textoNota
      .split("\n\n")
      .filter((p) => p.trim())
      .map((p) => ({ tipo: "paragrafo", texto: p.trim() }));

    try {
      const res = await salvarConteudoRegistroAcao(registro.id, blocos);
      if (res.sucesso) {
        setSalvandoStatus("salvo");
        aoAtualizar({ ...registro, conteudo: blocos });
      } else {
        setSalvandoStatus("erro");
      }
    } catch {
      setSalvandoStatus("erro");
    }
  };

  const aoDeletar = async () => {
    if (!confirm("Tem certeza que deseja excluir esta linha?")) return;
    const res = await deletarRegistroAcao(registro.id);
    if (res.sucesso) {
      aoExcluir(registro.id);
      aoFechar();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[var(--background)] border-l border-[var(--border)] shadow-2xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Barra superior do painel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-elevada)]/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
              <FileText className="h-3.5 w-3.5" />
              <span>Registro de Dados</span>
            </span>
            <span className="text-[var(--foreground-sutil)]">•</span>
            <span className="text-xs text-[var(--foreground-sutil)]">
              {salvandoStatus === "salvando"
                ? "Salvando alterações..."
                : salvandoStatus === "erro"
                ? "Falha ao salvar"
                : "Todas as alterações salvas"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={aoDeletar}
              title="Excluir Registro"
              className="p-1.5 rounded-[var(--raio-md)] text-[var(--perigo)] hover:bg-[var(--perigo-fundo)] transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={aoFechar}
              className="p-1.5 rounded-[var(--raio-md)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {/* Título do Registro */}
          <div>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onBlur={aoSalvarTitulo}
              className="w-full text-2xl font-bold bg-transparent text-[var(--foreground)] placeholder:text-[var(--foreground-sutil)] outline-none border-b border-transparent focus:border-[var(--border)] transition-colors pb-1"
              placeholder="Item sem título"
            />
          </div>

          {/* Propriedades Dinâmicas (Tabela de Propriedades do Notion) */}
          <div className="space-y-3 bg-[var(--surface-elevada)]/30 p-4 rounded-[var(--raio-lg)] border border-[var(--border)]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-sutil)]">
              Propriedades do Registro
            </h3>

            <div className="divide-y divide-[var(--border)]/60">
              {propriedades.map((prop) => {
                const valorAtual = valores[prop.nome] ?? "";
                return (
                  <div
                    key={prop.id}
                    className="grid grid-cols-3 items-center py-2.5 gap-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--foreground-muted)]">
                      {prop.tipo === "texto" && <Type className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />}
                      {prop.tipo === "numero" && <Hash className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />}
                      {prop.tipo === "selecao" && <Tag className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />}
                      {prop.tipo === "status" && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />}
                      {prop.tipo === "data" && <Calendar className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />}
                      {prop.tipo === "checkbox" && <CheckSquare className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />}
                      {prop.tipo === "email" && <Mail className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />}
                      {prop.tipo === "url" && <LinkIcon className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />}
                      <span className="truncate">{prop.nome}</span>
                    </div>

                    <div className="col-span-2">
                      {/* Seletor de opções para seleção ou status */}
                      {prop.tipo === "selecao" || prop.tipo === "status" ? (
                        <select
                          value={valorAtual}
                          onChange={(e) => aoAlterarValor(prop.nome, e.target.value)}
                          className="w-full text-xs bg-[var(--surface-elevada)] text-[var(--foreground)] border border-[var(--border)] rounded px-2.5 py-1.5 focus:outline-none focus:border-[var(--accent)]"
                        >
                          <option value="">(Vazio)</option>
                          {(prop.configuracoes?.opcoes || []).map((opc) => (
                            <option key={opc} value={opc}>
                              {opc}
                            </option>
                          ))}
                        </select>
                      ) : prop.tipo === "checkbox" ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(valorAtual)}
                            onChange={(e) => aoAlterarValor(prop.nome, e.target.checked)}
                            className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0 cursor-pointer h-4 w-4"
                          />
                          <span className="text-xs text-[var(--foreground-muted)]">
                            {Boolean(valorAtual) ? "Concluído" : "Pendente"}
                          </span>
                        </label>
                      ) : prop.tipo === "data" ? (
                        <input
                          type="date"
                          value={valorAtual}
                          onChange={(e) => aoAlterarValor(prop.nome, e.target.value)}
                          className="w-full text-xs bg-[var(--surface-elevada)] text-[var(--foreground)] border border-[var(--border)] rounded px-2.5 py-1.5 focus:outline-none focus:border-[var(--accent)]"
                        />
                      ) : (
                        <input
                          type={prop.tipo === "numero" ? "number" : "text"}
                          value={valorAtual}
                          onChange={(e) =>
                            setValores({ ...valores, [prop.nome]: e.target.value })
                          }
                          onBlur={(e) => aoAlterarValor(prop.nome, e.target.value)}
                          placeholder="Vazio"
                          className="w-full text-xs bg-transparent text-[var(--foreground)] placeholder:text-[var(--foreground-sutil)] border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none py-1 transition-colors"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Área de Documento / Notas da Página */}
          <div className="space-y-3 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-sutil)]">
                Documento & Anotações do Registro
              </h3>
              <span className="text-[11px] text-[var(--foreground-muted)]">
                Salva automaticamente ao desfocar
              </span>
            </div>

            <textarea
              rows={10}
              value={textoNota}
              onChange={(e) => setTextoNota(e.target.value)}
              onBlur={aoSalvarNota}
              placeholder="Escreva anotações, especificações ou detalhes deste registro aqui..."
              className="w-full text-xs leading-relaxed p-4 rounded-[var(--raio-md)] bg-[var(--surface-elevada)]/20 text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] resize-y transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
