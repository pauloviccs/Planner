import * as React from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { AlternadorTema } from "@/componentes/layout/alternador-tema";

export default function LayoutAutenticacao({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen flex flex-col justify-between bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-white"
      suppressHydrationWarning
    >
      {/* Luz ambiente de fundo (Glow sutil) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--accent)]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Topbar minimalista com logo e seletor de tema */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border)]"
        suppressHydrationWarning
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-sm tracking-tight text-[var(--foreground)] hover:opacity-85 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--raio-md)] bg-[var(--accent)] text-white shadow-sm">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <span className="font-bold">VICCS Planner</span>
        </Link>
        <AlternadorTema />
      </header>

      {/* Área central com os formulários */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>

      {/* Rodapé institucional */}
      <footer
        className="relative z-10 py-4 text-center text-xs text-[var(--foreground-muted)] border-t border-[var(--border)]"
        suppressHydrationWarning
      >
        <span>© {new Date().getFullYear()} VICCS Planner. Plataforma de produtividade e colaboração.</span>
      </footer>
    </div>
  );
}
