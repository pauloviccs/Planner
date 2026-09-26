"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, AlertCircle, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { esquemaRecuperarSenha, type TipoRecuperarSenha } from "@/lib/validacoes/auth";
import { recuperarSenhaAcao } from "@/lib/acoes/auth-acoes";
import { Card, CardCabecalho, CardTitulo, CardDescricao, CardConteudo, CardRodape } from "@/componentes/ui/card";
import { Botao } from "@/componentes/ui/botao";
import { Input } from "@/componentes/ui/input";
import { Rotulo } from "@/componentes/ui/rotulo";

export default function PaginaRecuperarSenha() {
  const [erroGeral, setErroGeral] = React.useState<string | null>(null);
  const [sucessoMensagem, setSucessoMensagem] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TipoRecuperarSenha>({
    resolver: zodResolver(esquemaRecuperarSenha),
    defaultValues: { email: "" },
  });

  const onSubmit = async (dados: TipoRecuperarSenha) => {
    setCarregando(true);
    setErroGeral(null);
    setSucessoMensagem(null);

    try {
      const resposta = await recuperarSenhaAcao(dados.email);
      if (!resposta.sucesso) {
        setErroGeral(resposta.mensagem || "Não foi possível processar a recuperação.");
        setCarregando(false);
        return;
      }

      setSucessoMensagem(resposta.mensagem || "Link de recuperação enviado para o seu e-mail!");
    } catch {
      setErroGeral("Ocorreu um erro ao enviar a solicitação.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card glass className="border-[var(--border)] shadow-[var(--sombra-lg)]">
      <CardCabecalho className="text-center pb-6">
        <CardTitulo className="text-xl font-bold">Recuperar senha</CardTitulo>
        <CardDescricao>
          Informe seu e-mail cadastrado e enviaremos instruções para redefinir sua senha.
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
            <Rotulo htmlFor="email" obrigatorio>
              E-mail cadastrado
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

          <Botao
            type="submit"
            className="w-full mt-2"
            tamanho="lg"
            carregando={carregando}
          >
            <span>Enviar link de recuperação</span>
            <Send className="h-4 w-4 ml-1" />
          </Botao>
        </form>
      </CardConteudo>

      <CardRodape className="justify-center text-xs text-[var(--foreground-muted)]">
        <Link
          href="/entrar"
          className="inline-flex items-center gap-1 font-semibold text-[var(--accent)] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar para o login</span>
        </Link>
      </CardRodape>
    </Card>
  );
}
