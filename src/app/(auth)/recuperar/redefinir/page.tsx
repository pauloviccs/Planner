"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { esquemaRedefinirSenha, type TipoRedefinirSenha } from "@/lib/validacoes/auth";
import { redefinirSenhaAcao } from "@/lib/acoes/auth-acoes";
import { Card, CardCabecalho, CardTitulo, CardDescricao, CardConteudo, CardRodape } from "@/componentes/ui/card";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";

export default function PaginaRedefinirSenha() {
  const router = useRouter();
  const [erroGeral, setErroGeral] = React.useState<string | null>(null);
  const [sucessoMensagem, setSucessoMensagem] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TipoRedefinirSenha>({
    resolver: zodResolver(esquemaRedefinirSenha),
    defaultValues: {
      senha: "",
      confirmar_senha: "",
    },
  });

  const onSubmit = async (dados: TipoRedefinirSenha) => {
    setCarregando(true);
    setErroGeral(null);
    setSucessoMensagem(null);

    try {
      const resposta = await redefinirSenhaAcao(dados);
      if (!resposta.sucesso) {
        setErroGeral(resposta.mensagem || "Não foi possível alterar sua senha.");
        setCarregando(false);
        return;
      }

      setSucessoMensagem(
        resposta.mensagem || "Senha atualizada com sucesso! Redirecionando..."
      );

      setTimeout(() => {
        router.push("/entrar?mensagem=Sua nova senha ja esta ativa.");
      }, 1500);
    } catch {
      setErroGeral("Ocorreu um erro ao atualizar a senha.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card glass className="border-[var(--border)] shadow-[var(--sombra-lg)]">
      <CardCabecalho className="text-center pb-6">
        <CardTitulo className="text-xl font-bold">Criar nova senha</CardTitulo>
        <CardDescricao>
          Defina uma senha segura para voltar a acessar o seu workspace.
        </CardDescricao>
      </CardCabecalho>

      <CardConteudo>
        {sucessoMensagem && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-[var(--raio-md)] bg-[var(--sucesso-fundo)] text-[var(--sucesso)] text-xs border border-[var(--sucesso)]/20">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{sucessoMensagem}</span>
          </div>
        )}

        {erroGeral && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-[var(--raio-md)] bg-[var(--perigo-fundo)] text-[var(--perigo)] text-xs border border-[var(--perigo)]/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{erroGeral}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Rotulo htmlFor="senha" obrigatorio>
              Nova senha (mínimo 6 caracteres, letras e números)
            </Rotulo>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              iconeEsquerda={<Lock className="h-4 w-4" />}
              erro={errors.senha?.message}
              {...register("senha")}
            />
          </div>

          <div>
            <Rotulo htmlFor="confirmar_senha" obrigatorio>
              Confirmar nova senha
            </Rotulo>
            <Input
              id="confirmar_senha"
              type="password"
              placeholder="••••••••"
              iconeEsquerda={<Lock className="h-4 w-4" />}
              erro={errors.confirmar_senha?.message}
              {...register("confirmar_senha")}
            />
          </div>

          <Botao
            type="submit"
            className="w-full mt-2"
            tamanho="lg"
            carregando={carregando}
          >
            <span>Salvar nova senha</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Botao>
        </form>
      </CardConteudo>

      <CardRodape className="justify-center text-xs text-[var(--foreground-muted)]">
        <Link
          href="/entrar"
          className="font-semibold text-[var(--accent)] hover:underline"
        >
          Ir para o login
        </Link>
      </CardRodape>
    </Card>
  );
}
