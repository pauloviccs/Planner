"use client";

import { useEffect, useRef } from "react";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface OpcoesRealtime<T extends Record<string, any> = Record<string, any>> {
  tabela: string;
  schema?: string;
  filtro?: string;
  aoMudar: (payload: RealtimePostgresChangesPayload<T>) => void;
  ativo?: boolean;
}

/**
 * Hook do React para escutar alterações em tabelas do Supabase via WebSockets (Realtime).
 * Suporta inserções, atualizações e exclusões instantâneas entre múltiplos clientes/abas.
 */
export function usarRealtime<T extends Record<string, any> = Record<string, any>>({
  tabela,
  schema = "public",
  filtro,
  aoMudar,
  ativo = true,
}: OpcoesRealtime<T>) {
  const aoMudarRef = useRef(aoMudar);
  aoMudarRef.current = aoMudar;

  useEffect(() => {
    if (!ativo) return;

    const supabase = criarClienteNavegador();
    const nomeCanal = `canal_${tabela}_${Math.random().toString(36).substring(2, 9)}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = {
      event: "*",
      schema,
      table: tabela,
    };

    if (filtro) {
      config.filter = filtro;
    }

    const canal = supabase
      .channel(nomeCanal)
      .on("postgres_changes", config, (payload: RealtimePostgresChangesPayload<T>) => {
        aoMudarRef.current(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [tabela, schema, filtro, ativo]);
}
