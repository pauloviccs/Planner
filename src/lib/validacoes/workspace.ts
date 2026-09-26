import { z } from "zod";

export const esquemaCriarWorkspace = z.object({
  nome: z
    .string()
    .min(2, "O nome do workspace deve ter pelo menos 2 caracteres")
    .max(50, "O nome não pode exceder 50 caracteres"),
  descricao: z.string().max(200, "A descrição não pode exceder 200 caracteres").optional(),
  tipo: z.enum(["pessoal", "equipe"]),
});

export type TipoCriarWorkspace = z.infer<typeof esquemaCriarWorkspace>;

export const esquemaAtualizarWorkspace = z.object({
  nome: z.string().min(2).max(50).optional(),
  descricao: z.string().max(200).optional(),
  icone_url: z.string().optional(),
  tipo: z.enum(["pessoal", "equipe"]).optional(),
});

export type TipoAtualizarWorkspace = z.infer<typeof esquemaAtualizarWorkspace>;
