"use client";

import * as React from "react";
import { Plus, X, Type, Hash, Tag, CheckCircle2, Calendar, CheckSquare, Mail, Link as LinkIcon } from "lucide-react";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";
import { adicionarPropriedadeAcao, type PropriedadeBanco } from "@/lib/acoes/banco-dados-acoes";

interface PropsModalAdicionarColuna {
  aberto: boolean;
  aoFechar: () => void;
  bancoId: string;
  aoAdicionar: (propriedade: PropriedadeBanco) => void;
}

const TIPOS_PROPRIEDADE: Array<{
  tipo: PropriedadeBanco["tipo"];
  rotulo: string;
  descricao: string;
  icone: React.ComponentType<{ className?: string }>;
}> = [
  { tipo: "texto", rotulo: "Texto", descricao: "Anotações e textos simples", icone: Type },
  { tipo: "numero", rotulo: "Número", descricao: "Valores numéricos e contagens", icone: Hash },
  { tipo: "selecao", rotulo: "Seleção Única", descricao: "Escolha uma entre várias opções", icone: Tag },
  { tipo: "status", rotulo: "Status", descricao: "Acompanhe fases e progresso", icone: CheckCircle2 },
  { tipo: "data", rotulo: "Data", descricao: "Prazos e agendamentos", icone: Calendar },
  { tipo: "checkbox", rotulo: "Caixa de Seleção", descricao: "Sim / Não (booleano)", icone: CheckSquare },
  { tipo: "email", rotulo: "E-mail", descricao: "Endereços de contato", icone: Mail },
  { tipo: "url", rotulo: "Link / URL", descricao: "Links web externos", icone: LinkIcon },
];

export function ModalAdicionarColuna({
  aberto,
  aoFechar,
  bancoId,
  aoAdicionar,
}: PropsModalAdicionarColuna) {
  const [nome, setNome] = React.useState("");
  const [tipo, setTipo] = React.useState<PropriedadeBanco["tipo"]>("texto");
  const [opcoesTexto, setOpcoesTexto] = React.useState("Opção 1, Opção 2, Opção 3");
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  if (!aberto) return null;

  const aoSubmeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setSalvando(true);
    setErro(null);

    let configuracoes: { opcoes?: string[] } = {};
    if (tipo === "selecao" || tipo === "multi_selecao" || tipo === "status") {
      const opcoes = opcoesTexto
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
      configuracoes.opcoes = opcoes.length > 0 ? opcoes : ["Padrão"];
    }

    try {
      const res = await adicionarPropriedadeAcao(bancoId, nome, tipo, configuracoes);
      if (res.sucesso && res.propriedade) {
        aoAdicionar(res.propriedade as PropriedadeBanco);
        setNome("");
        setTipo("texto");
        aoFechar();
      } else {
        setErro(res.mensagem || "Erro ao adicionar coluna.");
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="superficie-glass border border-[var(--border)] rounded-[var(--raio-xl)] max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Adicionar Nova Propriedade
            </h2>
          </div>
          <button
            onClick={aoFechar}
            className="p-1 rounded-[var(--raio-sm)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevada)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {erro && (
          <div className="p-3 text-xs rounded bg-[var(--perigo-fundo)] text-[var(--perigo)] border border-[var(--perigo)]/20">
            {erro}
          </div>
        )}

        <form onSubmit={aoSubmeter} className="space-y-4">
          <div>
            <Rotulo htmlFor="nome-propriedade">Nome da Coluna *</Rotulo>
            <Input
              id="nome-propriedade"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Responsável, Estimativa, Categoria"
              required
              autoFocus
            />
          </div>

          <div>
            <Rotulo>Tipo de Dado</Rotulo>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {TIPOS_PROPRIEDADE.map((item) => {
                const Icone = item.icone;
                const selecionado = tipo === item.tipo;
                return (
                  <button
                    key={item.tipo}
                    type="button"
                    onClick={() => setTipo(item.tipo)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-[var(--raio-md)] border text-left transition-all ${
                      selecionado
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]"
                        : "border-[var(--border)] bg-[var(--surface-elevada)]/40 hover:bg-[var(--surface-elevada)] text-[var(--foreground-muted)]"
                    }`}
                  >
                    <Icone
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        selecionado ? "text-[var(--accent)]" : "text-[var(--foreground-sutil)]"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--foreground)] leading-none">
                        {item.rotulo}
                      </p>
                      <p className="text-[10px] text-[var(--foreground-muted)] mt-1 truncate">
                        {item.descricao}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {(tipo === "selecao" || tipo === "status") && (
            <div>
              <Rotulo htmlFor="opcoes-propriedade">Opções (separadas por vírgula)</Rotulo>
              <Input
                id="opcoes-propriedade"
                value={opcoesTexto}
                onChange={(e) => setOpcoesTexto(e.target.value)}
                placeholder="Ex: Não Iniciado, Em Andamento, Concluído"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Botao type="button" variante="fantasma" onClick={aoFechar} disabled={salvando}>
              <span>Cancelar</span>
            </Botao>
            <Botao type="submit" carregando={salvando}>
              <span>Criar Propriedade</span>
            </Botao>
          </div>
        </form>
      </div>
    </div>
  );
}
