"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, AlertCircle, Building } from "lucide-react";
import {
  esquemaCriarWorkspace,
  type TipoCriarWorkspace,
} from "@/lib/validacoes/workspace";
import { criarWorkspaceAcao } from "@/lib/acoes/workspace-acoes";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";

export function FormularioCriarWorkspace() {
  const router = useRouter();
  const [carregando, setCarregando] = React.useState(false);
  const [erroGeral, setErroGeral] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TipoCriarWorkspace>({
    resolver: zodResolver(esquemaCriarWorkspace),
    defaultValues: {
      nome: "",
      descricao: "",
      tipo: "pessoal",
    },
  });

  const onSubmit = async (dados: TipoCriarWorkspace) => {
    setCarregando(true);
    setErroGeral(null);

    try {
      const res = await criarWorkspaceAcao(dados);
      if (!res.sucesso || !res.workspace) {
        setErroGeral(res.mensagem || "Erro ao criar workspace.");
        setCarregando(false);
        return;
      }

      router.push(`/${res.workspace.id}`);
      router.refresh();
    } catch {
      setErroGeral("Ocorreu um erro ao criar o workspace.");
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
      {erroGeral && (
        <div className="flex items-center gap-2 p-3 rounded-[var(--raio-md)] bg-[var(--perigo-fundo)] text-[var(--perigo)] text-xs border border-[var(--perigo)]/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{erroGeral}</span>
        </div>
      )}

      <div>
        <Rotulo htmlFor="nome" obrigatorio>
          Nome do Workspace
        </Rotulo>
        <Input
          id="nome"
          placeholder="Ex: Minha Empresa ou Estudos"
          iconeEsquerda={<Building className="h-4 w-4" />}
          erro={errors.nome?.message}
          {...register("nome")}
        />
      </div>

      <div>
        <Rotulo htmlFor="descricao">Descrição (opcional)</Rotulo>
        <Input
          id="descricao"
          placeholder="Finalidade deste espaço de trabalho"
          erro={errors.descricao?.message}
          {...register("descricao")}
        />
      </div>

      <div>
        <Rotulo htmlFor="tipo">Tipo de Workspace</Rotulo>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 p-2.5 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)] cursor-pointer hover:border-[var(--border-hover)] text-xs">
            <input
              type="radio"
              value="pessoal"
              className="accent-[var(--accent)]"
              {...register("tipo")}
            />
            <span className="font-medium text-[var(--foreground)]">Pessoal</span>
          </label>
          <label className="flex items-center gap-2 p-2.5 rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)] cursor-pointer hover:border-[var(--border-hover)] text-xs">
            <input
              type="radio"
              value="equipe"
              className="accent-[var(--accent)]"
              {...register("tipo")}
            />
            <span className="font-medium text-[var(--foreground)]">Equipe</span>
          </label>
        </div>
      </div>

      <Botao
        type="submit"
        className="w-full mt-3"
        carregando={carregando}
      >
        <Plus className="h-4 w-4 mr-1" />
        <span>Criar Workspace</span>
      </Botao>
    </form>
  );
}
