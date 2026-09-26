"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { convidarMembroAcao } from "@/lib/acoes/membro-acoes";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";

export function FormularioConvidarMembro({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [papel, setPapel] = React.useState<"admin" | "membro" | "convidado">("membro");
  const [carregando, setCarregando] = React.useState(false);
  const [mensagemSucesso, setMensagemSucesso] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  const aoConvidar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setCarregando(true);
    setErro(null);
    setMensagemSucesso(null);

    try {
      const res = await convidarMembroAcao(workspaceId, email, papel);
      if (res.sucesso) {
        setMensagemSucesso(res.mensagem || "Membro adicionado com sucesso!");
        setEmail("");
        router.refresh();
      } else {
        setErro(res.mensagem || "Erro ao adicionar membro.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={aoConvidar} className="space-y-3 pt-1">
      {mensagemSucesso && (
        <div className="flex items-center gap-1.5 p-2 rounded bg-[var(--sucesso-fundo)] text-[var(--sucesso)] text-xs border border-[var(--sucesso)]/20">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div className="flex items-center gap-1.5 p-2 rounded bg-[var(--perigo-fundo)] text-[var(--perigo)] text-xs border border-[var(--perigo)]/20">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div>
        <Rotulo htmlFor="email-membro">E-mail do usuário</Rotulo>
        <Input
          id="email-membro"
          type="email"
          placeholder="colega@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          iconeEsquerda={<Mail className="h-4 w-4" />}
          required
        />
      </div>

      <div>
        <Rotulo htmlFor="papel-membro">Nível de Permissão</Rotulo>
        <select
          id="papel-membro"
          value={papel}
          onChange={(e) =>
            setPapel(e.target.value as "admin" | "membro" | "convidado")
          }
          className="w-full h-9 px-3 text-xs rounded-[var(--raio-md)] bg-[var(--surface-elevada)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
        >
          <option value="membro">Membro (pode criar e editar)</option>
          <option value="admin">Administrador (gerencia configurações)</option>
          <option value="convidado">Convidado (acesso limitado)</option>
        </select>
      </div>

      <Botao type="submit" className="w-full mt-2" carregando={carregando}>
        <span>Adicionar ao Workspace</span>
      </Botao>
    </form>
  );
}
