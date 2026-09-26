"use client";

import * as React from "react";
import { Plus, FileText, Calendar, Tag, CheckCircle2 } from "lucide-react";
import { Badge } from "@/componentes/ui/badge";
import type { PropriedadeBanco, RegistroBanco } from "@/lib/acoes/banco-dados-acoes";
import { criarRegistroAcao } from "@/lib/acoes/banco-dados-acoes";

interface PropsGaleriaBanco {
  bancoId: string;
  propriedades: PropriedadeBanco[];
  registros: RegistroBanco[];
  termoBusca?: string;
  aoAbrirRegistro: (registro: RegistroBanco) => void;
  aoAtualizarRegistros: (novosRegistros: RegistroBanco[]) => void;
}

export function GaleriaBanco({
  bancoId,
  propriedades,
  registros,
  termoBusca = "",
  aoAbrirRegistro,
  aoAtualizarRegistros,
}: PropsGaleriaBanco) {
  const [criando, setCriando] = React.useState(false);

  const registrosFiltrados = React.useMemo(() => {
    if (!termoBusca.trim()) return registros;
    const q = termoBusca.toLowerCase();
    return registros.filter((reg) => {
      if (reg.titulo.toLowerCase().includes(q)) return true;
      for (const val of Object.values(reg.valores || {})) {
        if (String(val).toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [registros, termoBusca]);

  const aoCriarNovoCard = async () => {
    setCriando(true);
    try {
      const res = await criarRegistroAcao(bancoId, "Novo Item");
      if (res.sucesso && res.registro) {
        aoAtualizarRegistros([...registros, res.registro as RegistroBanco]);
        aoAbrirRegistro(res.registro as RegistroBanco);
      }
    } finally {
      setCriando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {registrosFiltrados.map((reg) => {
        return (
          <div
            key={reg.id}
            onClick={() => aoAbrirRegistro(reg)}
            className="superficie-glass border border-[var(--border)] rounded-[var(--raio-lg)] p-4 cursor-pointer hover:border-[var(--accent)] hover:shadow-lg transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-[var(--accent)] shrink-0" />
                <h4 className="text-sm font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                  {reg.titulo}
                </h4>
              </div>

              {/* Exibição resumida de propriedades principais */}
              <div className="space-y-1.5 mt-3">
                {propriedades.slice(0, 3).map((prop) => {
                  const val = reg.valores?.[prop.nome];
                  if (!val && val !== false) return null;
                  return (
                    <div
                      key={prop.id}
                      className="flex items-center justify-between text-[11px] text-[var(--foreground-muted)]"
                    >
                      <span className="text-[var(--foreground-sutil)] truncate mr-2">
                        {prop.nome}:
                      </span>
                      {prop.tipo === "status" || prop.tipo === "selecao" ? (
                        <Badge variante="padrao" tamanho="sm">
                          {String(val)}
                        </Badge>
                      ) : prop.tipo === "checkbox" ? (
                        <span className="font-medium">
                          {val ? "Sim" : "Não"}
                        </span>
                      ) : (
                        <span className="font-medium truncate max-w-[120px]">
                          {String(val)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)]/40 mt-3 flex items-center justify-between text-[10px] text-[var(--foreground-sutil)]">
              <span>Clique para abrir página</span>
            </div>
          </div>
        );
      })}

      {/* Card para Adicionar Novo */}
      <button
        type="button"
        onClick={aoCriarNovoCard}
        disabled={criando}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border)] rounded-[var(--raio-lg)] text-[var(--foreground-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all min-h-[140px] group"
      >
        <Plus className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-semibold">Novo Cartão</span>
      </button>
    </div>
  );
}
