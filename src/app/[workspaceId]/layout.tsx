import * as React from "react";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { obterPaginasDoWorkspace } from "@/lib/acoes/pagina-acoes";
import { obterProjetosDoWorkspace } from "@/lib/acoes/projeto-acoes";
import { ShellApp } from "@/componentes/layout/shell-app";

interface PropriedadesLayoutWorkspace {
  children: React.ReactNode;
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function LayoutWorkspace({
  children,
  params,
}: PropriedadesLayoutWorkspace) {
  const { workspaceId } = await params;
  const supabase = await criarClienteServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  // 1. Busca perfil do usuário
  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2. Busca informações do workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  const nomeWorkspace = workspace?.nome || "Meu Workspace";

  // 3. Busca lista de páginas e projetos para a sidebar e busca global
  const [paginas, projetos] = await Promise.all([
    obterPaginasDoWorkspace(workspaceId),
    obterProjetosDoWorkspace(workspaceId),
  ]);

  return (
    <ShellApp
      workspaceId={workspaceId}
      nomeWorkspace={nomeWorkspace}
      paginas={paginas}
      projetos={projetos}
      tituloAtual={nomeWorkspace}
      usuario={{
        id: user.id,
        email: user.email || "",
        nome_completo: perfil?.nome_completo || user.email,
        avatar_url: perfil?.avatar_url,
      }}
    >
      {children}
    </ShellApp>
  );
}
