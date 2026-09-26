"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { deletarWorkspaceAcao } from "@/lib/acoes/workspace-acoes";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

interface PropriedadesDialogExcluirWorkspace {
  workspaceId: string;
  nomeWorkspace: string;
}

export function DialogExcluirWorkspace({
  workspaceId,
  nomeWorkspace,
}: PropriedadesDialogExcluirWorkspace) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = React.useState(false);
  const [confirmacaoTexto, setConfirmacaoTexto] = React.useState("");
  const [excluindo, setExcluindo] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const confirmacaoValida = confirmacaoTexto.trim() === nomeWorkspace.trim();

  const aoExcluir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmacaoValida || excluindo) return;

    setExcluindo(true);
    setErro(null);

    try {
      const res = await deletarWorkspaceAcao(workspaceId);
      if (!res.sucesso) {
        setErro(res.mensagem || "Não foi possível excluir o workspace.");
        setExcluindo(false);
      } else {
        setModalAberto(false);
        // Redireciona para o próximo workspace ou para a tela de seleção
        const destino = res.proximoWorkspaceId
          ? `/${res.proximoWorkspaceId}`
          : "/selecionar-workspace";
        router.push(destino);
        router.refresh();
      }
    } catch {
      setErro("Ocorreu um erro inesperado ao excluir o workspace.");
      setExcluindo(false);
    }
  };

  return (
    <>
      <div className="rounded-[var(--raio-lg)] border border-red-500/30 bg-red-500/5 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--raio-md)] bg-red-500/10 text-red-500">
            <AlertTriangle className="h-5 w-5" suppressHydrationWarning />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-500">
              Zona de Perigo: Excluir Workspace
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              Uma vez excluído, todos os dados, projetos, quadros Kanban e notas vinculados a este workspace serão permanentemente destruídos. Essa ação é irreversível.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => {
              setConfirmacaoTexto("");
              setErro(null);
              setModalAberto(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-[var(--raio-md)] transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" suppressHydrationWarning />
            <span>Excluir este Workspace</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="superficie-glass w-full max-w-md rounded-[var(--raio-xl)] border border-red-500/30 p-6 shadow-[var(--sombra-xl)] space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <Trash2 className="h-4 w-4" />
                <span>Excluir Workspace Permanentemente</span>
              </div>
              <button
                type="button"
                onClick={() => !excluindo && setModalAberto(false)}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--foreground-muted)]">
              <p>
                Tem certeza de que deseja excluir o workspace{" "}
                <strong className="text-[var(--foreground)] font-semibold">
                  {nomeWorkspace}
                </strong>
                ?
              </p>
              <div className="p-3 rounded-[var(--raio-md)] bg-red-500/10 border border-red-500/20 text-red-300 space-y-1">
                <p className="font-semibold text-red-400">Atenção:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Todas as páginas e notas serão excluídas</li>
                  <li>Todos os quadros Kanban e cartões serão apagados</li>
                  <li>Todos os membros perderão o acesso</li>
                </ul>
              </div>
              <p>
                Para confirmar a exclusão, digite exatamente o nome do workspace:{" "}
                <span className="font-mono font-semibold text-[var(--foreground)] select-all">
                  {nomeWorkspace}
                </span>
              </p>
            </div>

            {erro && (
              <div className="p-2.5 text-xs rounded-[var(--raio-md)] bg-red-500/10 border border-red-500/20 text-red-400">
                {erro}
              </div>
            )}

            <form onSubmit={aoExcluir} className="space-y-4">
              <Input
                value={confirmacaoTexto}
                onChange={(e) => setConfirmacaoTexto(e.target.value)}
                placeholder={nomeWorkspace}
                disabled={excluindo}
                className="text-xs"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={excluindo}
                  className="px-3.5 py-1.5 text-xs rounded-[var(--raio-md)] border border-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--surface-elevada)] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!confirmacaoValida || excluindo}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-[var(--raio-md)] bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                >
                  {excluindo ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Confirmar Exclusão</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
