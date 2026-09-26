"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

interface PropriedadesVisualizadorPaginaPublica {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conteudo: any;
}

export function VisualizadorPaginaPublica({
  conteudo,
}: PropriedadesVisualizadorPaginaPublica) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: conteudo || "<p>Nenhum conteúdo adicionado.</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none text-[var(--foreground)] leading-relaxed text-sm md:text-base selection:bg-[var(--accent)] selection:text-white",
      },
    },
  });

  if (!editor) {
    return (
      <div className="py-8 text-center text-xs text-[var(--foreground-muted)]">
        Carregando documento...
      </div>
    );
  }

  return (
    <div className="tiptap-publico">
      <EditorContent editor={editor} />
    </div>
  );
}
