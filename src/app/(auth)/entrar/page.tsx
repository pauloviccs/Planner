"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { esquemaEntrar, type TipoEntrar } from "@/lib/validacoes/auth";
import { entrarAcao } from "@/lib/acoes/auth-acoes";
import { Card, CardCabecalho, CardTitulo, CardDescricao, CardConteudo, CardRodape } from "@/componentes/ui/card";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";

function FormularioEntrar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [erroGeral, setErroGeral] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);

  const mensagemParam = searchParams.get("mensagem");
  const erroParam = searchParams.get("erro");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TipoEntrar>({
    resolver: zodResolver(esquemaEntrar),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const onSubmit = async (dados: TipoEntrar) => {
    setCarregando(true);
    setErroGeral(null);

    try {
      const resposta = await entrarAcao(dados);
      if (!resposta.sucesso) {
        setErroGeral(resposta.mensagem || "Erro ao realizar login.");
        setCarregando(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErroGeral("Ocorreu um erro inesperado ao conectar ao servidor.");
      setCarregando(false);
    }
  };

  return (
    <Card glass className="border-[var(--border)] shadow-[var(--sombra-lg)]">
      <CardCabecalho className="text-center pb-6">
        <CardTitulo className="text-xl font-bold">Bem-vindo de volta</CardTitulo>
        <CardDescricao>
          Entre com seu e-mail e senha para acessar seu workspace.
        </CardDescricao>
      </CardCabecalho>

      <CardConteudo>
        {mensagemParam && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-[var(--raio-md)] bg-[var(--sucesso-fundo)] text-[var(--sucesso)] text-xs border border-[var(--sucesso)]/20">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{mensagemParam}</span>
          </div>
        )}

        {(erroGeral || erroParam) && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-[var(--raio-md)] bg-[var(--perigo-fundo)] text-[var(--perigo)] text-xs border border-[var(--perigo)]/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {erroGeral ||
                (erroParam === "codigo_invalido"
                  ? "Este link de confirmação já foi utilizado ou expirou. Se o seu e-mail já foi confirmado, basta entrar com sua senha."
                  : erroParam)}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Rotulo htmlFor="email" obrigatorio>
              E-mail
            </Rotulo>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              iconeEsquerda={<Mail className="h-4 w-4" />}
              erro={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Rotulo htmlFor="senha" obrigatorio className="mb-0">
                Senha
              </Rotulo>
              <Link
                href="/recuperar"
                className="text-xs text-[var(--accent)] hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              iconeEsquerda={<Lock className="h-4 w-4" />}
              erro={errors.senha?.message}
              {...register("senha")}
            />
          </div>

          <Botao
            type="submit"
            className="w-full mt-2"
            tamanho="lg"
            carregando={carregando}
          >
            <span>Entrar no Workspace</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Botao>
        </form>
      </CardConteudo>

      <CardRodape className="justify-center text-xs text-[var(--foreground-muted)]">
        <span>Não tem uma conta?</span>
        <Link
          href="/cadastro"
          className="ml-1 font-semibold text-[var(--accent)] hover:underline"
        >
          Cadastre-se gratuitamente
        </Link>
      </CardRodape>
    </Card>
  );
}

export default function PaginaEntrar() {
  return (
    <React.Suspense
      fallback={
        <Card glass className="border-[var(--border)] p-8 text-center text-xs text-[var(--foreground-muted)]">
          Carregando tela de acesso...
        </Card>
      }
    >
      <FormularioEntrar />
    </React.Suspense>
  );
}
