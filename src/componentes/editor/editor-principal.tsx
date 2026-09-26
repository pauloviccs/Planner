"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Star,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { atualizarPaginaAcao, excluirPaginaAcao } from "@/lib/acoes/pagina-acoes";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { registrarAnexoAcao } from "@/lib/acoes/anexo-acoes";
import { GerenciadorAnexos } from "@/componentes/compartilhado/gerenciador-anexos";

interface PropriedadesEditorPrincipal {
  paginaId: string;
  workspaceId: string;
  tituloInicial: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conteudoInicial: any;
  favoritaInicial: boolean;
}

type StatusSalvar = "salvo" | "salvando" | "erro";

export function EditorPrincipal({
  paginaId,
  workspaceId,
  tituloInicial,
  conteudoInicial,
  favoritaInicial,
}: PropriedadesEditorPrincipal) {
  const router = useRouter();
  const [titulo, setTitulo] = React.useState(tituloInicial);
  const [favorita, setFavorita] = React.useState(favoritaInicial);
  const [statusSalvar, setStatusSalvar] = React.useState<StatusSalvar>("salvo");
  const temporizadorSalvarRef = React.useRef<NodeJS.Timeout | null>(null);

  // Inicializa o Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Escreva suas anotações ou ideias aqui...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: conteudoInicial || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[450px] text-[var(--foreground)] leading-relaxed text-sm md:text-base",
      },
    },
    onUpdate: ({ editor }) => {
      agendarSalvamento({ conteudo: editor.getJSON() });
    },
  });

  const [fazendoUploadImagem, setFazendoUploadImagem] = React.useState(false);
  const inputImagemRef = React.useRef<HTMLInputElement>(null);

  const lidarComUploadImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo || !editor) return;

    setFazendoUploadImagem(true);
    const supabase = criarClienteNavegador();
    const nomeLimpo = arquivo.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
    const caminhoStorage = `${workspaceId}/pagina/${paginaId}/${Date.now()}_${nomeLimpo}`;

    try {
      const { error: erroUpload } = await supabase.storage
        .from("workspace-arquivos")
        .upload(caminhoStorage, arquivo);

      if (erroUpload) throw new Error(erroUpload.message);

      const { data: dataUrl } = supabase.storage
        .from("workspace-arquivos")
        .getPublicUrl(caminhoStorage);

      const urlPublica = dataUrl?.publicUrl || "";

      editor.chain().focus().setImage({ src: urlPublica, alt: arquivo.name }).run();

      await registrarAnexoAcao({
        workspaceId,
        recursoTipo: "pagina",
        recursoId: paginaId,
        nomeArquivo: arquivo.name,
        tamanhoBytes: arquivo.size,
        mimeType: arquivo.type || "image/png",
        caminhoStorage,
        urlPublica,
      });
    } catch (err: any) {
      console.error("Erro ao subir imagem no editor:", err);
      alert("Falha ao fazer upload da imagem: " + (err?.message || ""));
    } finally {
      setFazendoUploadImagem(false);
      if (inputImagemRef.current) inputImagemRef.current.value = "";
    }
  };

  // Função para salvar alterações com debounce
  const agendarSalvamento = (dados: {
    titulo?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conteudo?: any;
    favorita?: boolean;
  }) => {
    setStatusSalvar("salvando");
    if (temporizadorSalvarRef.current) {
      clearTimeout(temporizadorSalvarRef.current);
    }

    temporizadorSalvarRef.current = setTimeout(async () => {
      try {
        const res = await atualizarPaginaAcao(paginaId, dados);
        if (res.sucesso) {
          setStatusSalvar("salvo");
        } else {
          setStatusSalvar("erro");
        }
      } catch {
        setStatusSalvar("erro");
      }
    }, 1000);
  };

  const aoMudarTitulo = (novoTitulo: string) => {
    setTitulo(novoTitulo);
    agendarSalvamento({ titulo: novoTitulo });
  };

  const aoAlternarFavorito = async () => {
    const novoValor = !favorita;
    setFavorita(novoValor);
    await atualizarPaginaAcao(paginaId, { favorita: novoValor });
    router.refresh();
  };

  const aoExcluirPagina = async () => {
    if (confirm("Tem certeza que deseja excluir esta página permanentemente?")) {
      const res = await excluirPaginaAcao(paginaId, workspaceId);
      if (res.sucesso) {
        router.push(`/${workspaceId}/paginas`);
        router.refresh();
      }
    }
  };

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--foreground-muted)] text-sm">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Carregando editor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Ferramentas Fixa no Topo do Editor */}
      <div className="superficie-glass sticky top-[calc(var(--topbar-altura)+8px)] z-20 flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-[var(--raio-md)] border border-[var(--border)] shadow-[var(--sombra-sm)]">
        {/* Controles de Formatação */}
        <div className="flex flex-wrap items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              editor.isActive("bold")
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            }`}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              editor.isActive("italic")
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            }`}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              editor.isActive("heading", { level: 1 })
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            }`}
            title="Título 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              editor.isActive("heading", { level: 2 })
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            }`}
            title="Título 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              editor.isActive("heading", { level: 3 })
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            }`}
            title="Título 3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              editor.isActive("bulletList")
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            }`}
            title="Lista com marcadores"
          >
            <List className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              editor.isActive("orderedList")
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            }`}
            title="Lista numerada"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              editor.isActive("taskList")
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            }`}
            title="Checklist de tarefas"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              editor.isActive("blockquote")
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            }`}
            title="Citação"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              editor.isActive("codeBlock")
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)]"
            }`}
            title="Bloco de código"
          >
            <Code className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)] transition-colors cursor-pointer"
            title="Divisor horizontal"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => inputImagemRef.current?.click()}
            disabled={fazendoUploadImagem}
            className="p-1.5 rounded text-xs text-[var(--foreground-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-elevada)] transition-colors cursor-pointer disabled:opacity-50"
            title="Inserir Imagem (Upload Supabase)"
          >
            {fazendoUploadImagem ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5" />
            )}
          </button>

          <input
            ref={inputImagemRef}
            type="file"
            accept="image/*"
            onChange={lidarComUploadImagem}
            className="hidden"
          />
        </div>

        {/* Lado Direito: Status de Salvamento e Ações da Página */}
        <div className="flex items-center gap-3">
          {/* Indicador de Status */}
          <div className="flex items-center gap-1.5 text-xs">
            {statusSalvar === "salvo" && (
              <span className="text-[var(--sucesso)] flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Salvo</span>
              </span>
            )}
            {statusSalvar === "salvando" && (
              <span className="text-[var(--aviso)] flex items-center gap-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Salvando...</span>
              </span>
            )}
            {statusSalvar === "erro" && (
              <span className="text-[var(--perigo)] flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Erro ao salvar</span>
              </span>
            )}
          </div>

          {/* Favoritar */}
          <button
            type="button"
            onClick={aoAlternarFavorito}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              favorita
                ? "text-amber-500 fill-amber-500 hover:opacity-80"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
            title={favorita ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star className={`h-4 w-4 ${favorita ? "fill-amber-500" : ""}`} />
          </button>

          {/* Excluir Página */}
          <button
            type="button"
            onClick={aoExcluirPagina}
            className="p-1.5 rounded text-[var(--foreground-muted)] hover:text-[var(--perigo)] transition-colors cursor-pointer"
            title="Excluir página"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Título do Documento Editável */}
      <div className="pt-4 pb-2">
        <input
          type="text"
          value={titulo}
          onChange={(e) => aoMudarTitulo(e.target.value)}
          placeholder="Título da página"
          className="w-full bg-transparent text-2xl md:text-4xl font-bold tracking-tight text-[var(--foreground)] placeholder:text-[var(--foreground-sutil)] focus:outline-none border-b border-transparent focus:border-[var(--border)] pb-1 transition-colors"
        />
      </div>

      {/* Conteúdo Principal do Editor */}
      <div className="superficie-glass p-6 md:p-8 rounded-[var(--raio-lg)] border border-[var(--border)] shadow-[var(--sombra-sm)]">
        <EditorContent editor={editor} />
      </div>

      {/* Seção de Arquivos e Anexos da Página */}
      <div className="superficie-glass p-6 rounded-[var(--raio-lg)] border border-[var(--border)] shadow-[var(--sombra-sm)]">
        <GerenciadorAnexos
          workspaceId={workspaceId}
          recursoTipo="pagina"
          recursoId={paginaId}
        />
      </div>
    </div>
  );
}
