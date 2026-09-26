"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { esquemaCadastro, type TipoCadastro } from "@/lib/validacoes/auth";
import { cadastrarAcao } from "@/lib/acoes/auth-acoes";
import { Card, CardCabecalho, CardTitulo, CardDescricao, CardConteudo, CardRodape } from "@/componentes/ui/card";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";

export default function PaginaCadastro() {
  const router = useRouter();
  const [erroGeral, setErroGeral] = React.useState<string | null>(null);
  const [sucessoMensagem, setSucessoMensagem] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TipoCadastro>({
    resolver: zodResolver(esquemaCadastro),
    defaultValues: {
      nome_completo: "",
      email: "",
      senha: "",
      confirmar_senha: "",
    },
  });

  const onSubmit = async (dados: TipoCadastro) => {
    setCarregando(true);
    setErroGeral(null);
    setSucessoMensagem(null);

    try {
      const resposta = await cadastrarAcao(dados);
      if (!resposta.sucesso) {
        setErroGeral(resposta.mensagem || "Erro ao realizar cadastro.");
        setCarregando(false);
        return;
      }

      setSucessoMensagem(
        resposta.mensagem || "Cadastro realizado com sucesso! Redirecionando..."
      );

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch {
      setErroGeral("Ocorreu um erro ao conectar ao servidor.");
      setCarregando(false);
    }
  };

  return (
    <Card glass className="border-[var(--border)] shadow-[var(--sombra-lg)]">
      <CardCabecalho className="text-center pb-6">
        <CardTitulo className="text-xl font-bold">Crie sua conta</CardTitulo>
        <CardDescricao>
          Comece a organizar suas notas, wikis e quadros Kanban em minutos.
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div>
            <Rotulo htmlFor="nome_completo" obrigatorio>
              Nome completo
            </Rotulo>
            <Input
              id="nome_completo"
              placeholder="Ex: Carlos Silva"
              iconeEsquerda={<User className="h-4 w-4" />}
              erro={errors.nome_completo?.message}
              {...register("nome_completo")}
            />
          </div>

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
            <Rotulo htmlFor="senha" obrigatorio>
              Senha (mínimo 6 caracteres, letras e números)
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
              Confirmar senha
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
            <span>Criar Conta</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Botao>
        </form>
      </CardConteudo>

      <CardRodape className="justify-center text-xs text-[var(--foreground-muted)]">
        <span>Já possui uma conta?</span>
        <Link
          href="/entrar"
          className="ml-1 font-semibold text-[var(--accent)] hover:underline"
        >
          Faça login
        </Link>
      </CardRodape>
    </Card>
  );
}
