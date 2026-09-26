"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Database, Sparkles, X } from "lucide-react";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";
import { criarBancoAcao } from "@/lib/acoes/banco-dados-acoes";

export function FormularioCriarBanco({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [aberto, setAberto] = React.useState(false);
  const [nome, setNome] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [visaoPadrao, setVisaoPadrao] = React.useState<"tabela" | "galeria">("tabela");
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const aoSubmeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setSalvando(true);
    setErro(null);

    try {
      const res = await criarBancoAcao(workspaceId, nome, descricao, visaoPadrao);
      if (res.sucesso && res.banco) {
        setAberto(false);
        setNome("");
        setDescricao("");
        router.push(`/${workspaceId}/bancos/${res.banco.id}`);
        router.refresh();
      } else {
        setErro(res.mensagem || "Erro ao criar base de dados.");
      }
    } finally {
      setSalvando(false);
    }
  };

  if (!aberto) {
    return (
      <Botao onClick={() => setAberto(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        <span>Nova Base de Dados</span>
      </Botao>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="superficie-glass border border-[var(--border)] rounded-[var(--raio-xl)] max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Criar Nova Base de Dados
            </h2>
          </div>
          <button
            onClick={() => setAberto(false)}
            className="p-1 rounded text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {erro && (
          <div className="p-3 text-xs rounded bg-[var(--perigo-fundo)] text-[var(--perigo)] border border-[var(--perigo)]/20 leading-relaxed">
            {erro}
          </div>
        )}

        <form onSubmit={aoSubmeter} className="space-y-4">
          <div>
            <Rotulo htmlFor="nome-banco">Nome da Base *</Rotulo>
            <Input
              id="nome-banco"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Roadmap de Produto, Clientes, Inventário"
              required
              autoFocus
            />
          </div>

          <div>
            <Rotulo htmlFor="desc-banco">Descrição (opcional)</Rotulo>
            <Input
              id="desc-banco"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Para que serve esta base de dados?"
            />
          </div>

          <div>
            <Rotulo htmlFor="visao-banco">Visualização Padrão</Rotulo>
            <select
              id="visao-banco"
              value={visaoPadrao}
              onChange={(e) => setVisaoPadrao(e.target.value as "tabela" | "galeria")}
              className="w-full h-9 px-3 text-xs rounded-[var(--raio-md)] bg-[var(--surface-elevada)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              <option value="tabela">Tabela Interativa (Planilha)</option>
              <option value="galeria">Galeria de Cartões</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Botao
              type="button"
              variante="fantasma"
              onClick={() => setAberto(false)}
              disabled={salvando}
            >
              <span>Cancelar</span>
            </Botao>
            <Botao type="submit" carregando={salvando}>
              <span>Criar Base</span>
            </Botao>
          </div>
        </form>
      </div>
    </div>
  );
}
