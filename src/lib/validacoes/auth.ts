import { z } from "zod";

export const esquemaEntrar = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Insira um endereço de e-mail válido"),
  senha: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type TipoEntrar = z.infer<typeof esquemaEntrar>;

export const esquemaCadastro = z
  .object({
    nome_completo: z
      .string()
      .min(2, "O nome deve ter pelo menos 2 caracteres")
      .max(80, "O nome não pode ter mais de 80 caracteres"),
    email: z
      .string()
      .min(1, "O e-mail é obrigatório")
      .email("Insira um endereço de e-mail válido"),
    senha: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .regex(/[A-Za-z]/, "A senha deve conter ao menos uma letra")
      .regex(/[0-9]/, "A senha deve conter ao menos um número"),
    confirmar_senha: z.string().min(1, "Confirme sua senha"),
  })
  .refine((dados) => dados.senha === dados.confirmar_senha, {
    message: "As senhas não coincidem",
    path: ["confirmar_senha"],
  });

export type TipoCadastro = z.infer<typeof esquemaCadastro>;

export const esquemaRecuperarSenha = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Insira um endereço de e-mail válido"),
});

export type TipoRecuperarSenha = z.infer<typeof esquemaRecuperarSenha>;

export const esquemaRedefinirSenha = z
  .object({
    senha: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .regex(/[A-Za-z]/, "A senha deve conter ao menos uma letra")
      .regex(/[0-9]/, "A senha deve conter ao menos um número"),
    confirmar_senha: z.string().min(1, "Confirme sua nova senha"),
  })
  .refine((dados) => dados.senha === dados.confirmar_senha, {
    message: "As senhas não coincidem",
    path: ["confirmar_senha"],
  });

export type TipoRedefinirSenha = z.infer<typeof esquemaRedefinirSenha>;
