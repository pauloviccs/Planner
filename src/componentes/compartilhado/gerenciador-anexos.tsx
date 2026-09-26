"use client";

import * as React from "react";
import {
  Paperclip,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileArchive,
  FileCode,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import {
  registrarAnexoAcao,
  deletarAnexoAcao,
  obterAnexosDoRecurso,
  type AnexoRecurso,
} from "@/lib/acoes/anexo-acoes";

interface PropriedadesGerenciadorAnexos {
  workspaceId: string;
  recursoTipo: "cartao" | "pagina";
  recursoId: string;
}

export function GerenciadorAnexos({
  workspaceId,
  recursoTipo,
  recursoId,
}: PropriedadesGerenciadorAnexos) {
  const [anexos, setAnexos] = React.useState<AnexoRecurso[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [fazendoUpload, setFazendoUpload] = React.useState(false);
  const [progressoTexto, setProgressoTexto] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [excluindoId, setExcluindoId] = React.useState<string | null>(null);
  const inputArquivoRef = React.useRef<HTMLInputElement>(null);

  // Carregar anexos ao inicializar
  const carregarAnexos = React.useCallback(async () => {
    try {
      setCarregando(true);
      const lista = await obterAnexosDoRecurso(recursoTipo, recursoId);
      setAnexos(lista);
    } catch (err) {
      console.error("Erro ao carregar anexos:", err);
    } finally {
      setCarregando(false);
    }
  }, [recursoTipo, recursoId]);

  React.useEffect(() => {
    carregarAnexos();
  }, [carregarAnexos]);

  // Função para formatar bytes em KB/MB
  const formatarTamanho = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Ícone por tipo MIME
  const renderizarIconeArquivo = (mime: string) => {
    if (mime.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5 text-indigo-400 shrink-0" suppressHydrationWarning />;
    }
    if (mime.includes("pdf") || mime.includes("document") || mime.includes("text")) {
      return <FileText className="w-5 h-5 text-blue-400 shrink-0" suppressHydrationWarning />;
    }
    if (mime.includes("zip") || mime.includes("compressed") || mime.includes("tar")) {
      return <FileArchive className="w-5 h-5 text-amber-400 shrink-0" suppressHydrationWarning />;
    }
    if (mime.includes("json") || mime.includes("javascript") || mime.includes("html")) {
      return <FileCode className="w-5 h-5 text-emerald-400 shrink-0" suppressHydrationWarning />;
    }
    return <Paperclip className="w-5 h-5 text-zinc-400 shrink-0" suppressHydrationWarning />;
  };

  // Processo de Upload
  const lidarComSelecaoArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = e.target.files;
    if (!arquivos || arquivos.length === 0) return;

    setFazendoUpload(true);
    setErro(null);

    const supabase = criarClienteNavegador();

    for (let i = 0; i < arquivos.length; i++) {
      const arquivo = arquivos[i];
      setProgressoTexto(`Enviando ${arquivo.name} (${i + 1}/${arquivos.length})...`);

      // Sanitizar nome do arquivo e gerar caminho único no storage
      const extensao = arquivo.name.split(".").pop() || "";
      const nomeBaseLimpo = arquivo.name
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .slice(0, 50);
      const caminhoStorage = `${workspaceId}/${recursoTipo}/${recursoId}/${Date.now()}_${nomeBaseLimpo}`;

      try {
        // 1. Upload direto ao Supabase Storage
        const { error: erroUpload } = await supabase.storage
          .from("workspace-arquivos")
          .upload(caminhoStorage, arquivo, {
            cacheControl: "3600",
            upsert: false,
          });

        if (erroUpload) {
          throw new Error(erroUpload.message);
        }

        // 2. Obter URL pública
        const { data: dataUrl } = supabase.storage
          .from("workspace-arquivos")
          .getPublicUrl(caminhoStorage);

        const urlPublica = dataUrl?.publicUrl || "";

        // 3. Registrar anexo no banco de dados via Server Action
        const resultado = await registrarAnexoAcao({
          workspaceId,
          recursoTipo,
          recursoId,
          nomeArquivo: arquivo.name,
          tamanhoBytes: arquivo.size,
          mimeType: arquivo.type || "application/octet-stream",
          caminhoStorage,
          urlPublica,
        });

        if (!resultado.sucesso) {
          throw new Error(resultado.erro || "Falha ao registrar anexo.");
        }
      } catch (errUpload: any) {
        console.error("Erro no upload do arquivo:", errUpload);
        setErro(`Falha ao enviar ${arquivo.name}: ${errUpload?.message || "Erro desconhecido"}`);
        break;
      }
    }

    // Limpar input e atualizar lista
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = "";
    }
    setFazendoUpload(false);
    setProgressoTexto(null);
    carregarAnexos();
  };

  // Excluir anexo
  const lidarComExclusao = async (anexoId: string) => {
    if (!confirm("Deseja realmente excluir este anexo?")) return;

    setExcluindoId(anexoId);
    try {
      const resultado = await deletarAnexoAcao(anexoId, workspaceId);
      if (resultado.sucesso) {
        setAnexos((anteriores) => anteriores.filter((a) => a.id !== anexoId));
      } else {
        alert(resultado.erro || "Não foi possível excluir o anexo.");
      }
    } catch (errDelete) {
      console.error("Erro ao excluir anexo:", errDelete);
      alert("Erro ao excluir anexo.");
    } finally {
      setExcluindoId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2 text-foreground">
          <Paperclip className="w-4 h-4 text-indigo-400" suppressHydrationWarning />
          Anexos e Arquivos ({anexos.length})
        </h3>

        <button
          type="button"
          onClick={() => inputArquivoRef.current?.click()}
          disabled={fazendoUpload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          {fazendoUpload ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" suppressHydrationWarning />
          ) : (
            <UploadCloud className="w-3.5 h-3.5" suppressHydrationWarning />
          )}
          Anexar Arquivo
        </button>

        <input
          ref={inputArquivoRef}
          type="file"
          multiple
          onChange={lidarComSelecaoArquivo}
          className="hidden"
          disabled={fazendoUpload}
        />
      </div>

      {/* Alerta de erro */}
      {erro && (
        <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
          {erro}
        </div>
      )}

      {/* Indicador de progresso */}
      {fazendoUpload && (
        <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15 text-xs text-indigo-300 flex items-center gap-2 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" suppressHydrationWarning />
          <span>{progressoTexto || "Processando arquivo..."}</span>
        </div>
      )}

      {/* Lista de anexos */}
      {carregando ? (
        <div className="space-y-2">
          <div className="h-12 rounded-lg bg-zinc-800/20 animate-pulse" />
          <div className="h-12 rounded-lg bg-zinc-800/20 animate-pulse" />
        </div>
      ) : anexos.length === 0 ? (
        <div
          onClick={() => inputArquivoRef.current?.click()}
          className="p-6 border border-dashed border-zinc-700/50 hover:border-indigo-500/40 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-zinc-900/20 hover:bg-zinc-900/40 group"
        >
          <UploadCloud
            className="w-8 h-8 text-zinc-500 group-hover:text-indigo-400 transition-colors mb-2"
            suppressHydrationWarning
          />
          <span className="text-xs text-zinc-300 font-medium">
            Arraste ou clique para anexar arquivos
          </span>
          <span className="text-[11px] text-zinc-500 mt-0.5">
            Suporta imagens, PDFs, documentos, planilhas e arquivos ZIP até 50MB
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {anexos.map((anexo) => {
            const ehImagem = anexo.mime_type.startsWith("image/");

            return (
              <div
                key={anexo.id}
                className="group flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-800/40 border border-white/5 hover:border-white/10 transition-all text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {ehImagem ? (
                    <a
                      href={anexo.url_publica}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-md overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      {/* Miniatura da imagem */}
                      <img
                        src={anexo.url_publica}
                        alt={anexo.nome_arquivo}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-zinc-800/50 border border-white/5 shrink-0 flex items-center justify-center">
                      {renderizarIconeArquivo(anexo.mime_type)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <a
                      href={anexo.url_publica}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-indigo-400 transition-colors truncate block"
                      title={anexo.nome_arquivo}
                    >
                      {anexo.nome_arquivo}
                    </a>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{formatarTamanho(anexo.tamanho_bytes)}</span>
                      <span>•</span>
                      <span>
                        {new Date(anexo.criado_em).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={anexo.url_publica}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Abrir arquivo em nova aba"
                  >
                    <ExternalLink className="w-4 h-4" suppressHydrationWarning />
                  </a>

                  <button
                    type="button"
                    onClick={() => lidarComExclusao(anexo.id)}
                    disabled={excluindoId === anexo.id}
                    className="p-1.5 rounded-md hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Excluir anexo"
                  >
                    {excluindoId === anexo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" suppressHydrationWarning />
                    ) : (
                      <Trash2 className="w-4 h-4" suppressHydrationWarning />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
