"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, FolderKanban, X, ArrowRight } from "lucide-react";
import type { PaginaResumo } from "@/lib/acoes/pagina-acoes";
import type { ProjetoResumo } from "@/lib/acoes/projeto-acoes";

interface PropriedadesModalBuscaGlobal {
  workspaceId: string;
  paginas?: PaginaResumo[];
  projetos?: ProjetoResumo[];
  aberto: boolean;
  aoFechar: () => void;
}

export function ModalBuscaGlobal({
  workspaceId,
  paginas = [],
  projetos = [],
  aberto,
  aoFechar,
}: PropriedadesModalBuscaGlobal) {
  const router = useRouter();
  const [consulta, setConsulta] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (aberto) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setConsulta("");
    }
  }, [aberto]);

  // Filtra páginas e projetos
  const paginasFiltradas = React.useMemo(() => {
    if (!consulta.trim()) return paginas.slice(0, 5);
    return paginas.filter((p) =>
      p.titulo.toLowerCase().includes(consulta.toLowerCase())
    );
  }, [paginas, consulta]);

  const projetosFiltrados = React.useMemo(() => {
    if (!consulta.trim()) return projetos.slice(0, 5);
    return projetos.filter((p) =>
      p.nome.toLowerCase().includes(consulta.toLowerCase())
    );
  }, [projetos, consulta]);

  if (!aberto) return null;

  const aoNavegar = (url: string) => {
    aoFechar();
    router.push(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={aoFechar}
    >
      <div
        className="superficie-glass w-full max-w-lg rounded-[var(--raio-lg)] border border-[var(--border)] shadow-[var(--sombra-lg)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Busca com Input */}
        <div className="flex items-center px-4 py-3 border-b border-[var(--border)] gap-2.5">
          <Search className="h-4 w-4 text-[var(--foreground-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar páginas, projetos ou tarefas... (ESC para fechar)"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-sutil)] focus:outline-none"
          />
          <button
            onClick={aoFechar}
            className="p-1 rounded text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resultados */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Páginas */}
          {paginasFiltradas.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-sutil)]">
                Documentos ({paginasFiltradas.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {paginasFiltradas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => aoNavegar(`/${workspaceId}/paginas/${p.id}`)}
                    className="flex w-full items-center justify-between p-2 rounded hover:bg-[var(--surface-elevada)] text-xs text-[var(--foreground)] text-left group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-3.5 w-3.5 text-[var(--foreground-muted)] group-hover:text-[var(--accent)]" />
                      <span className="truncate">{p.titulo || "Sem título"}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projetos */}
          {projetosFiltrados.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-sutil)]">
                Projetos & Kanban ({projetosFiltrados.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {projetosFiltrados.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => aoNavegar(`/${workspaceId}/projetos/${proj.id}`)}
                    className="flex w-full items-center justify-between p-2 rounded hover:bg-[var(--surface-elevada)] text-xs text-[var(--foreground)] text-left group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderKanban className="h-3.5 w-3.5 text-[var(--foreground-muted)] group-hover:text-[var(--accent)]" />
                      <span className="truncate">{proj.nome}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {paginasFiltradas.length === 0 && projetosFiltrados.length === 0 && (
            <div className="py-8 text-center text-xs text-[var(--foreground-muted)]">
              Nenhum resultado encontrado para &quot;{consulta}&quot;.
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-between text-[11px] text-[var(--foreground-muted)]">
          <span>Pressione ESC para sair</span>
          <span>VICCS Planner</span>
        </div>
      </div>
    </div>
  );
}
