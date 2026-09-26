"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus, X } from "lucide-react";
import { criarProjetoAcao } from "@/lib/acoes/projeto-acoes";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";

interface PropriedadesModalCriarProjeto {
  workspaceId: string;
  textoBotao?: string;
}

const coresProjeto = [
  "#3b82f6", // Azul
  "#8b5cf6", // Roxo
  "#ec4899", // Rosa
  "#10b981", // Verde
  "#f59e0b", // Âmbar
  "#ef4444", // Vermelho
  "#64748b", // Cinza Ardósia
];

export function ModalCriarProjeto({
  workspaceId,
  textoBotao,
}: PropriedadesModalCriarProjeto) {
  const router = useRouter();
  const [aberto, setAberto] = React.useState(false);
  const [nome, setNome] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [cor, setCor] = React.useState(coresProjeto[0]);
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const aoSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("Informe o nome do projeto.");
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const res = await criarProjetoAcao(workspaceId, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        cor,
      });

      if (res.sucesso && res.projeto) {
        setAberto(false);
        setNome("");
        setDescricao("");
        router.push(`/${workspaceId}/projetos/${res.projeto.id}`);
        router.refresh();
      } else {
        setErro(res.mensagem || "Erro ao criar projeto.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      {textoBotao ? (
        <Botao onClick={() => setAberto(true)}>
          <Plus className="h-4 w-4 mr-1" />
          <span>{textoBotao}</span>
        </Botao>
      ) : (
        <button
          onClick={() => setAberto(true)}
          className="superficie-glass group flex items-center gap-3.5 p-4 rounded-[var(--raio-lg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:scale-[1.01] text-left cursor-pointer"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--raio-md)] bg-purple-500/15 text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--foreground)]">
              Novo Projeto
            </h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Gerencie tarefas em quadros Kanban personalizados
            </p>
          </div>
        </button>
      )}

      {/* Modal Dialog com Glassmorphism */}
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="superficie-glass w-full max-w-md rounded-[var(--raio-lg)] p-6 border border-[var(--border)] shadow-[var(--sombra-lg)] relative">
            <button
              onClick={() => setAberto(false)}
              className="absolute right-4 top-4 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-[var(--raio-sm)] text-white shadow-sm"
                style={{ backgroundColor: cor }}
              >
                <FolderKanban className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Criar Novo Projeto
              </h2>
            </div>

            {erro && (
              <p className="text-xs text-[var(--perigo)] mb-3 bg-[var(--perigo-fundo)] p-2 rounded">
                {erro}
              </p>
            )}

            <form onSubmit={aoSalvar} className="space-y-4">
              <div>
                <Rotulo htmlFor="nome-projeto" obrigatorio>
                  Nome do Projeto
                </Rotulo>
                <Input
                  id="nome-projeto"
                  placeholder="Ex: Lançamento do Produto"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <Rotulo htmlFor="desc-projeto">Descrição (opcional)</Rotulo>
                <Input
                  id="desc-projeto"
                  placeholder="Objetivos e escopo do projeto"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div>
                <Rotulo>Cor do Projeto</Rotulo>
                <div className="flex items-center gap-2 pt-1">
                  {coresProjeto.map((corItem) => (
                    <button
                      key={corItem}
                      type="button"
                      onClick={() => setCor(corItem)}
                      className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                        cor === corItem
                          ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)] scale-110"
                          : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: corItem }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border)]">
                <Botao
                  type="button"
                  variante="fantasma"
                  onClick={() => setAberto(false)}
                >
                  Cancelar
                </Botao>
                <Botao type="submit" carregando={carregando}>
                  Criar Projeto
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
