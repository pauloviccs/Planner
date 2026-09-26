import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ProvedorTema } from "@/componentes/provedores/provedor-tema"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "VICCS Planner",
    template: "%s | VICCS Planner",
  },
  description:
    "Workspace visual e colaborativo para documentos, conhecimento, projetos e tarefas.",
  keywords: [
    "planner",
    "projetos",
    "tarefas",
    "kanban",
    "documentos",
    "workspace",
    "colaborativo",
  ],
  other: {
    "darkreader-lock": "true",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-tema="escuro" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <ProvedorTema>{children}</ProvedorTema>
      </body>
    </html>
  )
}
