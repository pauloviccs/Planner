"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Building,
  ArrowRight,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type { WorkspaceComPapel } from "@/lib/acoes/workspace-acoes";
import { FormularioEditarWorkspace } from "@/componentes/workspace/formulario-editar-workspace";
import { DialogExcluirWorkspace } from "@/componentes/workspace/dialog-excluir-workspace";

interface PropriedadesItemWorkspaceCard {
  workspace: WorkspaceComPapel;
}

export function ItemWorkspaceCard({ workspace }: PropriedadesItemWorkspaceCard) {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = React.useState(false);
  const [modalEditarAberto, setModalEditarAberto] = React.useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = React.useState(false);

  const menuRef = React.useRef<HTMLDivElement>(null);

  const ehProprietario = workspace.papel === "proprietario";
  const ehAdminOuProprietario =
    workspace.papel === "proprietario" || workspace.papel === "admin";

  React.useEffect(() => {
    const tratarCliqueFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    if (menuAberto) {
      document.addEventListener("mousedown", tratarCliqueFora);
    }
    return () => {
      document.removeEventListener("mousedown", tratarCliqueFora);
    };
  }, [menuAberto]);

  return (
    <>
      <div className="relative group">
        <Link
          href={`/${workspace.id}`}
          className="superficie-glass flex items-center justify-between p-4 rounded-[var(--raio-lg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--raio-md)] bg-[var(--surface-elevada)] text-[var(--accent)] font-bold text-base border border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
              {workspace.nome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-[var(--foreground)] flex items-center gap-1.5 truncate">
                <span className="truncate">{workspace.nome}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-elevada)] border border-[var(--border)] text-[var(--foreground-muted)] font-normal shrink-0">
                  {workspace.papel}
                </span>
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] flex items-center gap-2 mt-0.5 truncate">
                {workspace.tipo === "equipe" ? (
                  <span className="flex items-center gap-1 shrink-0">
                    <Users className="h-3 w-3" />
                    Equipe
                  </span>
                ) : (
                  <span className="flex items-center gap-1 shrink-0">
                    <Building className="h-3 w-3" />
                    Pessoal
                  </span>
                )}
                <span>•</span>
                <span className="truncate">/{workspace.slug}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all mr-1" />
          </div>
        </Link>

        {/* Menu de Ações (Editar / Excluir) */}
        {ehAdminOuProprietario && (
          <div
            ref={menuRef}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuAberto((prev) => !prev);
              }}
              className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)] transition-colors cursor-pointer"
              title="Opções do workspace"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuAberto && (
              <div className="superficie-glass absolute right-0 mt-1 w-36 rounded-[var(--raio-md)] border border-[var(--border)] py-1 shadow-[var(--sombra-lg)] z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuAberto(false);
                    setModalEditarAberto(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--surface-elevada)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Editar</span>
                </button>

                {ehProprietario && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuAberto(false);
                      setModalExcluirAberto(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Edição Rápida */}
      {modalEditarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="superficie-glass w-full max-w-lg rounded-[var(--raio-xl)] border border-[var(--border)] p-6 shadow-[var(--sombra-xl)] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 font-semibold text-sm text-[var(--foreground)]">
                <Pencil className="h-4 w-4 text-[var(--accent)]" />
                <span>Editar Workspace</span>
              </div>
              <button
                type="button"
                onClick={() => setModalEditarAberto(false)}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <FormularioEditarWorkspace
              workspace={{
                id: workspace.id,
                nome: workspace.nome,
                descricao: workspace.descricao,
                tipo: workspace.tipo,
                slug: workspace.slug,
              }}
              podeEditar={ehAdminOuProprietario}
            />
          </div>
        </div>
      )}

      {/* Modal de Exclusão Rápida */}
      {modalExcluirAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="superficie-glass w-full max-w-md rounded-[var(--raio-xl)] border border-red-500/30 p-6 shadow-[var(--sombra-xl)] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-semibold text-xs text-red-400">
                Gerenciar Ciclo de Vida
              </span>
              <button
                type="button"
                onClick={() => setModalExcluirAberto(false)}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <DialogExcluirWorkspace
              workspaceId={workspace.id}
              nomeWorkspace={workspace.nome}
            />
          </div>
        </div>
      )}
    </>
  );
}
