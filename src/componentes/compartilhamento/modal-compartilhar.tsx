"use client";

import * as React from "react";
import {
  Share2,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Loader2,
  X,
} from "lucide-react";
import {
  alternarCompartilhamentoPagina,
  alternarCompartilhamentoProjeto,
} from "@/lib/acoes/compartilhamento-acoes";
import { Botao } from "@/componentes/ui/botao";

interface PropriedadesModalCompartilhar {
  id: string;
  tipo: "pagina" | "projeto";
  titulo: string;
  publicoInicial: boolean;
  tokenPublicoInicial?: string | null;
}

export function ModalCompartilhar({
  id,
  tipo,
  titulo,
  publicoInicial,
  tokenPublicoInicial,
}: PropriedadesModalCompartilhar) {
  const [aberto, setAberto] = React.useState(false);
  const [publico, setPublico] = React.useState(publicoInicial);
  const [tokenPublico, setTokenPublico] = React.useState<string | null>(
    tokenPublicoInicial || null
  );
  const [salvando, setSalvando] = React.useState(false);
  const [copiado, setCopiado] = React.useState(false);
  const [urlPublica, setUrlPublica] = React.useState("");

  // Monta a URL completa no navegador
  React.useEffect(() => {
    if (typeof window !== "undefined" && tokenPublico) {
      const rota = tipo === "pagina" ? "p" : "quadro";
      setUrlPublica(`${window.location.origin}/publico/${rota}/${tokenPublico}`);
    }
  }, [tokenPublico, tipo]);

  const handleAlternarPublico = async () => {
    setSalvando(true);
    const novoEstado = !publico;

    try {
      const res =
        tipo === "pagina"
          ? await alternarCompartilhamentoPagina(id, novoEstado)
          : await alternarCompartilhamentoProjeto(id, novoEstado);

      if (res.sucesso && typeof res.publico === "boolean") {
        setPublico(res.publico);
        setTokenPublico(res.tokenPublico || null);
      }
    } catch (err) {
      console.error("Erro ao alternar compartilhamento:", err);
    } finally {
      setSalvando(false);
    }
  };

  const copiarLink = async () => {
    if (!urlPublica) return;
    try {
      await navigator.clipboard.writeText(urlPublica);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Botão de Disparo */}
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--raio-sm)] text-xs font-medium bg-[var(--surface-elevada)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] transition-all cursor-pointer shadow-2xs"
        title="Compartilhar na web"
      >
        <Share2 className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
        <span>Compartilhar</span>
        {publico && (
          <span
            className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
            title="Público na web"
          />
        )}
      </button>

      {/* Modal / Diálogo Glassmorphism */}
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="superficie-glass w-full max-w-md rounded-[var(--raio-lg)] border border-[var(--border)] shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-[var(--raio-sm)] bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">
                    Compartilhar na Web
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">
                    {titulo}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAberto(false)}
                className="p-1 rounded text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Alternador Público / Privado */}
            <div className="flex items-center justify-between p-3 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)]">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
                  {publico ? (
                    <>
                      <Globe className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Público na Web</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
                      <span>Privado para o Workspace</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[var(--foreground-muted)]">
                  {publico
                    ? "Qualquer pessoa com o link pode visualizar esta versão em modo leitura."
                    : "Apenas membros autenticados deste workspace têm acesso."}
                </p>
              </div>

              <button
                onClick={handleAlternarPublico}
                disabled={salvando}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  publico ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                }`}
              >
                {salvando ? (
                  <span className="flex h-5 w-5 items-center justify-center">
                    <Loader2 className="h-3 w-3 animate-spin text-white" />
                  </span>
                ) : (
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      publico ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                )}
              </button>
            </div>

            {/* Se estiver público, exibe o link e ações */}
            {publico && urlPublica && (
              <div className="space-y-3 pt-1">
                <label className="text-xs font-medium text-[var(--foreground-muted)]">
                  Link Público de Visualização
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={urlPublica}
                    className="flex-1 px-3 py-1.5 text-xs rounded-[var(--raio-sm)] bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none font-mono select-all"
                  />
                  <Botao
                    variante="padrao"
                    tamanho="sm"
                    onClick={copiarLink}
                    className="shrink-0 flex items-center gap-1"
                  >
                    {copiado ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </Botao>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={urlPublica}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
                  >
                    <span>Abrir link em nova aba</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <span className="text-[11px] text-[var(--foreground-muted)]">
                    Modo Leitura (Read-only)
                  </span>
                </div>
              </div>
            )}

            {/* Rodapé com botão Concluído */}
            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <Botao
                variante="secundario"
                tamanho="sm"
                onClick={() => setAberto(false)}
              >
                Concluído
              </Botao>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
