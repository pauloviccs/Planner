"use client";

import * as React from "react";
import {
  Plus,
  Type,
  Hash,
  Tag,
  CheckCircle2,
  Calendar,
  CheckSquare,
  Mail,
  Link as LinkIcon,
  Maximize2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/componentes/ui/badge";
import type { PropriedadeBanco, RegistroBanco } from "@/lib/acoes/banco-dados-acoes";
import {
  atualizarRegistroAcao,
  criarRegistroAcao,
  deletarRegistroAcao,
} from "@/lib/acoes/banco-dados-acoes";

interface PropsTabelaBanco {
  bancoId: string;
  propriedades: PropriedadeBanco[];
  registros: RegistroBanco[];
  termoBusca?: string;
  aoAbrirRegistro: (registro: RegistroBanco) => void;
  aoAbrirModalColuna: () => void;
  aoAtualizarRegistros: (novosRegistros: RegistroBanco[]) => void;
}

export function TabelaBanco({
  bancoId,
  propriedades,
  registros,
  termoBusca = "",
  aoAbrirRegistro,
  aoAbrirModalColuna,
  aoAtualizarRegistros,
}: PropsTabelaBanco) {
  const [novoTitulo, setNovoTitulo] = React.useState("");
  const [criandoLinha, setCriandoLinha] = React.useState(false);

  // Filtragem local pelo termo de busca
  const registrosFiltrados = React.useMemo(() => {
    if (!termoBusca.trim()) return registros;
    const q = termoBusca.toLowerCase();
    return registros.filter((reg) => {
      if (reg.titulo.toLowerCase().includes(q)) return true;
      for (const val of Object.values(reg.valores || {})) {
        if (String(val).toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [registros, termoBusca]);

  // Atualização rápida de célula inline
  const aoEditarCelula = async (
    registroId: string,
    campo: string,
    novoValor: any,
    isTitulo: boolean = false
  ) => {
    const atualizados = registros.map((r) => {
      if (r.id === registroId) {
        if (isTitulo) return { ...r, titulo: novoValor };
        return { ...r, valores: { ...r.valores, [campo]: novoValor } };
      }
      return r;
    });
    aoAtualizarRegistros(atualizados);

    try {
      if (isTitulo) {
        await atualizarRegistroAcao(registroId, { titulo: novoValor });
      } else {
        const item = registros.find((r) => r.id === registroId);
        const novosValores = { ...(item?.valores || {}), [campo]: novoValor };
        await atualizarRegistroAcao(registroId, { valores: novosValores });
      }
    } catch (e) {
      console.error("Falha ao salvar célula:", e);
    }
  };

  // Criação rápida de nova linha
  const aoCriarLinha = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const titulo = novoTitulo.trim() || "Item sem título";
    setCriandoLinha(true);

    try {
      const res = await criarRegistroAcao(bancoId, titulo);
      if (res.sucesso && res.registro) {
        aoAtualizarRegistros([...registros, res.registro as RegistroBanco]);
        setNovoTitulo("");
      }
    } finally {
      setCriandoLinha(false);
    }
  };

  const aoExcluirLinha = async (registroId: string) => {
    const atualizados = registros.filter((r) => r.id !== registroId);
    aoAtualizarRegistros(atualizados);
    await deletarRegistroAcao(registroId);
  };

  const obterIconeTipo = (tipo: PropriedadeBanco["tipo"]) => {
    switch (tipo) {
      case "texto":
        return <Type className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />;
      case "numero":
        return <Hash className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />;
      case "selecao":
        return <Tag className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />;
      case "status":
        return <CheckCircle2 className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />;
      case "data":
        return <Calendar className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />;
      case "checkbox":
        return <CheckSquare className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />;
      case "email":
        return <Mail className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />;
      case "url":
        return <LinkIcon className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />;
      default:
        return <Type className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />;
    }
  };

  return (
    <div className="overflow-x-auto rounded-[var(--raio-lg)] border border-[var(--border)] superficie-glass">
      <table className="w-full border-collapse text-left text-xs">
        {/* Cabeçalho da Tabela */}
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-elevada)]/60 text-[var(--foreground-muted)] font-medium select-none">
            <th className="py-2.5 px-3 min-w-[240px] font-semibold text-[var(--foreground)]">
              <div className="flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-[var(--foreground-sutil)]" />
                <span>Nome / Título</span>
              </div>
            </th>

            {propriedades.map((prop) => (
              <th
                key={prop.id}
                className="py-2.5 px-3 min-w-[160px] border-l border-[var(--border)] font-semibold text-[var(--foreground)]"
              >
                <div className="flex items-center gap-1.5">
                  {obterIconeTipo(prop.tipo)}
                  <span className="truncate">{prop.nome}</span>
                </div>
              </th>
            ))}

            {/* Botão de Adicionar Coluna */}
            <th className="py-2 px-3 w-10 border-l border-[var(--border)] text-center">
              <button
                onClick={aoAbrirModalColuna}
                title="Adicionar Coluna"
                className="p-1 rounded text-[var(--foreground-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-elevada)] transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </th>
          </tr>
        </thead>

        {/* Corpo da Tabela */}
        <tbody className="divide-y divide-[var(--border)]">
          {registrosFiltrados.map((reg) => (
            <tr
              key={reg.id}
              className="group hover:bg-[var(--surface-elevada)]/40 transition-colors"
            >
              {/* Célula de Título com Botão de Abrir */}
              <td className="py-2 px-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={reg.titulo}
                    onChange={(e) =>
                      aoEditarCelula(reg.id, "titulo", e.target.value, true)
                    }
                    className="w-full font-medium bg-transparent text-[var(--foreground)] outline-none border-b border-transparent focus:border-[var(--accent)] py-0.5"
                  />
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => aoAbrirRegistro(reg)}
                      title="Abrir como página"
                      className="p-1 rounded text-[var(--foreground-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-elevada)] transition-colors"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => aoExcluirLinha(reg.id)}
                      title="Excluir linha"
                      className="p-1 rounded text-[var(--perigo)] hover:bg-[var(--perigo-fundo)] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </td>

              {/* Células Dinâmicas */}
              {propriedades.map((prop) => {
                const valor = reg.valores?.[prop.nome] ?? "";
                return (
                  <td
                    key={prop.id}
                    className="py-1 px-3 border-l border-[var(--border)] text-[var(--foreground-muted)]"
                  >
                    {prop.tipo === "selecao" || prop.tipo === "status" ? (
                      <select
                        value={valor}
                        onChange={(e) =>
                          aoEditarCelula(reg.id, prop.nome, e.target.value)
                        }
                        className="w-full bg-transparent text-xs text-[var(--foreground)] border-none outline-none py-1 cursor-pointer focus:bg-[var(--surface-elevada)] rounded"
                      >
                        <option value="">-</option>
                        {(prop.configuracoes?.opcoes || []).map((opc) => (
                          <option key={opc} value={opc}>
                            {opc}
                          </option>
                        ))}
                      </select>
                    ) : prop.tipo === "checkbox" ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={Boolean(valor)}
                          onChange={(e) =>
                            aoEditarCelula(reg.id, prop.nome, e.target.checked)
                          }
                          className="rounded border-[var(--border)] text-[var(--accent)] cursor-pointer h-3.5 w-3.5"
                        />
                      </div>
                    ) : prop.tipo === "data" ? (
                      <input
                        type="date"
                        value={valor}
                        onChange={(e) =>
                          aoEditarCelula(reg.id, prop.nome, e.target.value)
                        }
                        className="w-full bg-transparent text-xs text-[var(--foreground)] border-none outline-none py-1"
                      />
                    ) : (
                      <input
                        type={prop.tipo === "numero" ? "number" : "text"}
                        value={valor}
                        onChange={(e) =>
                          aoEditarCelula(reg.id, prop.nome, e.target.value)
                        }
                        placeholder="Vazio"
                        className="w-full bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-sutil)] border-none outline-none py-1"
                      />
                    )}
                  </td>
                );
              })}

              <td className="border-l border-[var(--border)]" />
            </tr>
          ))}

          {/* Linha Rápida para Adicionar Novo Item */}
          <tr>
            <td colSpan={propriedades.length + 2} className="p-2 bg-[var(--surface-elevada)]/20">
              <form onSubmit={aoCriarLinha} className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-[var(--foreground-sutil)] shrink-0 ml-1" />
                <input
                  type="text"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="+ Novo registro (digite e pressione Enter)..."
                  className="w-full bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-sutil)] outline-none py-1"
                  disabled={criandoLinha}
                />
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
