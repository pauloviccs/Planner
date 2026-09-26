"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

type Tema = "escuro" | "claro" | "sistema"
type TemaResolvido = "escuro" | "claro"

interface ContextoTema {
  tema: Tema
  temaResolvido: TemaResolvido
  alternarTema: (novoTema: Tema) => void
}

const ContextoTema = createContext<ContextoTema | undefined>(undefined)

const CHAVE_STORAGE = "viccs-planner-tema"

function resolverTema(tema: Tema): TemaResolvido {
  if (tema === "sistema") {
    if (typeof window === "undefined") return "escuro"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "escuro"
      : "claro"
  }
  return tema
}

export function ProvedorTema({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>("escuro")
  const [temaResolvido, setTemaResolvido] = useState<TemaResolvido>("escuro")

  // Inicializar tema do localStorage
  useEffect(() => {
    const temaSalvo = localStorage.getItem(CHAVE_STORAGE) as Tema | null
    if (temaSalvo && ["escuro", "claro", "sistema"].includes(temaSalvo)) {
      setTema(temaSalvo)
      setTemaResolvido(resolverTema(temaSalvo))
    }
  }, [])

  // Aplicar tema no documento
  useEffect(() => {
    const resolvido = resolverTema(tema)
    setTemaResolvido(resolvido)
    document.documentElement.setAttribute("data-tema", resolvido)
  }, [tema])

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    if (tema !== "sistema") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => {
      const novoResolvido = e.matches ? "escuro" : "claro"
      setTemaResolvido(novoResolvido)
      document.documentElement.setAttribute("data-tema", novoResolvido)
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [tema])

  const alternarTema = useCallback((novoTema: Tema) => {
    setTema(novoTema)
    localStorage.setItem(CHAVE_STORAGE, novoTema)
  }, [])

  return (
    <ContextoTema value={{ tema, temaResolvido, alternarTema }}>
      {children}
    </ContextoTema>
  )
}

export function usarTema() {
  const contexto = useContext(ContextoTema)
  if (!contexto) {
    throw new Error("usarTema deve ser usado dentro de ProvedorTema")
  }
  return contexto
}
