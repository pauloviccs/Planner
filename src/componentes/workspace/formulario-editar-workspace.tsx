"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { atualizarWorkspaceAcao } from "@/lib/acoes/workspace-acoes";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Building, Users, Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utilitarios";

interface PropriedadesFormularioEditarWorkspace {
  workspace: {
    id: string;
    nome: string;
    descricao?: string | null;
    tipo: "pessoal" | "equipe";
    slug: string;
  };
  podeEditar?: boolean;
}

export function FormularioEditarWorkspace({
  workspace,
  podeEditar = true,
}: PropriedadesFormularioEditarWorkspace) {
  const router = useRouter();
  const [nome, setNome] = React.useState(workspace.nome);
  const [descricao, setDescricao] = React.useState(workspace.descricao || "");
  const [tipo, setTipo] = React.useState<"pessoal" | "equipe">(workspace.tipo);

  const [salvando, setSalvando] = React.useState(false);
  const [mensagemSucesso, setMensagemSucesso] = React.useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = React.useState<string | null>(null);

  const houveAlteracao =
    nome.trim() !== workspace.nome ||
    descricao.trim() !== (workspace.descricao || "") ||
    tipo !== workspace.tipo;

  const aoSubmeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podeEditar || !houveAlteracao || salvando) return;

    if (nome.trim().length < 2) {
      setMensagemErro("O nome do workspace deve ter pelo menos 2 caracteres.");
      return;
    }

    setSalvando(true);
    setMensagemSucesso(null);
    setMensagemErro(null);

    try {
      const res = await atualizarWorkspaceAcao(workspace.id, {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        tipo,
      });

      if (!res.sucesso) {
        setMensagemErro(res.mensagem || "Não foi possível salvar as alterações.");
      } else {
        setMensagemSucesso("Workspace atualizado com sucesso!");
        router.refresh();
        setTimeout(() => setMensagemSucesso(null), 4000);
      }
    } catch {
      setMensagemErro("Ocorreu um erro inesperado ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={aoSubmeter} className="space-y-5">
      {mensagemSucesso && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-[var(--raio-md)] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Check className="h-4 w-4 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {mensagemErro && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-[var(--raio-md)] bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{mensagemErro}</span>
        </div>
      )}

      {/* Nome do Workspace */}
      <div className="space-y-1.5">
        <label
          htmlFor="ws-nome"
          className="block text-xs font-semibold text-[var(--foreground)]"
        >
          Nome do Workspace
        </label>
        <Input
          id="ws-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Minha Empresa ou Projetos Pessoais"
          disabled={!podeEditar || salvando}
          maxLength={50}
          required
        />
      </div>

      {/* Descrição */}
      <div className="space-y-1.5">
        <label
          htmlFor="ws-descricao"
          className="block text-xs font-semibold text-[var(--foreground)]"
        >
          Descrição (opcional)
        </label>
        <textarea
          id="ws-descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva a finalidade deste espaço..."
          disabled={!podeEditar || salvando}
          maxLength={200}
          rows={3}
          className="w-full rounded-[var(--raio-md)] bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-sutil)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none disabled:opacity-50"
        />
        <div className="text-right text-[10px] text-[var(--foreground-sutil)]">
          {descricao.length}/200
        </div>
      </div>

      {/* Tipo de Workspace */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[var(--foreground)]">
          Tipo de Espaço
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => podeEditar && setTipo("pessoal")}
            disabled={!podeEditar || salvando}
            className={cn(
              "flex items-center gap-3 p-3 rounded-[var(--raio-md)] border text-left transition-all cursor-pointer",
              tipo === "pessoal"
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:border-[var(--border-hover)]"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--raio-sm)]",
                tipo === "pessoal"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-elevada)] text-[var(--foreground-muted)]"
              )}
            >
              <Building className="h-4 w-4" suppressHydrationWarning />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--foreground)]">
                Pessoal
              </div>
              <div className="text-[10px] text-[var(--foreground-muted)]">
                Uso individual e privativo
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => podeEditar && setTipo("equipe")}
            disabled={!podeEditar || salvando}
            className={cn(
              "flex items-center gap-3 p-3 rounded-[var(--raio-md)] border text-left transition-all cursor-pointer",
              tipo === "equipe"
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:border-[var(--border-hover)]"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--raio-sm)]",
                tipo === "equipe"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-elevada)] text-[var(--foreground-muted)]"
              )}
            >
              <Users className="h-4 w-4" suppressHydrationWarning />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--foreground)]">
                Equipe
              </div>
              <div className="text-[10px] text-[var(--foreground-muted)]">
                Colaboração com convidados
              </div>
            </div>
          </button>
        </div>
      </div>

      {podeEditar && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <Botao
            type="submit"
            disabled={!houveAlteracao || salvando}
            className="text-xs"
          >
            {salvando ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Salvando...
              </span>
            ) : (
              "Salvar Alterações"
            )}
          </Botao>
        </div>
      )}
    </form>
  );
}
