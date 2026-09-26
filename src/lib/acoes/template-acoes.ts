"use server";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import { revalidatePath } from "next/cache";

export type TipoTemplateProjeto =
  | "sprint_agil"
  | "roadmap_produto"
  | "crm_vendas"
  | "lancamento_marketing";

export type TipoTemplatePagina =
  | "wiki_engenharia"
  | "reuniao_ata"
  | "especificacao_design"
  | "planejamento_semanal";

/**
 * Cria um projeto completo a partir de um template pré-definido.
 */
export async function aplicarTemplateProjeto(
  workspaceId: string,
  tipo: TipoTemplateProjeto
) {
  const supabase = await criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  const configs: Record<
    TipoTemplateProjeto,
    {
      nome: string;
      descricao: string;
      cor: string;
      colunas: { titulo: string; cor: string; cartoes: { titulo: string; prioridade: "baixa" | "media" | "alta" | "urgente"; descricao: string }[] }[];
    }
  > = {
    sprint_agil: {
      nome: "Sprint Ágil de Desenvolvimento",
      descricao: "Quadro Scrum para acompanhamento de épicos, histórias e entregas do ciclo ágil.",
      cor: "#3b82f6",
      colunas: [
        {
          titulo: "Backlog",
          cor: "#64748b",
          cartoes: [
            { titulo: "Levantamento de requisitos de segurança", prioridade: "media", descricao: "Revisar políticas de RLS e auditoria de tokens." },
            { titulo: "Otimização de tempo de carregamento", prioridade: "baixa", descricao: "Implementar lazy loading em imagens e componentes pesados." },
          ],
        },
        {
          titulo: "Em Sprint",
          cor: "#eab308",
          cartoes: [
            { titulo: "Desenvolver componentes da Linha do Tempo", prioridade: "alta", descricao: "Construir visualização de Gantt com navegação temporal." },
            { titulo: "Sincronização em tempo real via WebSockets", prioridade: "urgente", descricao: "Integrar Supabase Realtime aos quadros Kanban." },
          ],
        },
        {
          titulo: "Em Code Review",
          cor: "#8b5cf6",
          cartoes: [
            { titulo: "Validação de schemas com Zod", prioridade: "media", descricao: "Garantir sanitização rigorosa de inputs de formulários." },
          ],
        },
        {
          titulo: "Concluído",
          cor: "#10b981",
          cartoes: [
            { titulo: "Autenticação e RLS multi-tenant", prioridade: "alta", descricao: "Setup do Supabase com isolamento rigoroso por workspace." },
          ],
        },
      ],
    },
    roadmap_produto: {
      nome: "Roadmap de Produto",
      descricao: "Visão estratégica trimestral de evolução de produto e iniciativas de negócio.",
      cor: "#8b5cf6",
      colunas: [
        {
          titulo: "Q1 — Em Andamento",
          cor: "#3b82f6",
          cartoes: [
            { titulo: "Lançamento da v1.0 VICCS Planner", prioridade: "urgente", descricao: "Entrega do núcleo de produtividade híbrido Notion + Trello." },
            { titulo: "Módulo de Compartilhamento Público", prioridade: "alta", descricao: "Habilitar links de visualização pública protegidos por token." },
          ],
        },
        {
          titulo: "Q2 — Planejado",
          cor: "#06b6d4",
          cartoes: [
            { titulo: "App nativo para iOS e Android", prioridade: "alta", descricao: "Versão mobile com cache offline e notificações push." },
            { titulo: "Automações inteligentes e webhooks", prioridade: "media", descricao: "Integrações com GitHub, Slack e webhooks customizados." },
          ],
        },
        {
          titulo: "Q3 — Exploração",
          cor: "#64748b",
          cartoes: [
            { titulo: "Modelos de IA generativa no editor", prioridade: "media", descricao: "Resumos automáticos e expansão de notas em blocos." },
          ],
        },
        {
          titulo: "Lançado com Sucesso",
          cor: "#10b981",
          cartoes: [
            { titulo: "Dark/Light Glassmorphism Theme", prioridade: "baixa", descricao: "Design system com materiais visuais de alta fidelidade." },
          ],
        },
      ],
    },
    crm_vendas: {
      nome: "Pipeline de Vendas (CRM)",
      descricao: "Acompanhamento do ciclo de vendas e fechamento de clientes B2B.",
      cor: "#10b981",
      colunas: [
        {
          titulo: "Leads Qualificados",
          cor: "#64748b",
          cartoes: [
            { titulo: "TechCorp — 50 licenças corporativas", prioridade: "alta", descricao: "Demonstração agendada para quinta-feira às 15h." },
          ],
        },
        {
          titulo: "Proposta Enviada",
          cor: "#eab308",
          cartoes: [
            { titulo: "Inovare Studio — Plano Anual", prioridade: "media", descricao: "Aguardando aprovação do comitê financeiro." },
          ],
        },
        {
          titulo: "Negociação",
          cor: "#f97316",
          cartoes: [
            { titulo: "Nexus Logistics — Expansão de Contrato", prioridade: "urgente", descricao: "Revisão de cláusulas contratuais de SLA e suporte 24/7." },
          ],
        },
        {
          titulo: "Fechado Ganho",
          cor: "#10b981",
          cartoes: [
            { titulo: "Alpha Creative Labs — Onboarding concluído", prioridade: "alta", descricao: "Cliente ativado no plano Pro com sucesso." },
          ],
        },
      ],
    },
    lancamento_marketing: {
      nome: "Campanha de Lançamento",
      descricao: "Gestão de ativos, copywriting, redes sociais e mídia para lançamento.",
      cor: "#f43f5e",
      colunas: [
        {
          titulo: "Planejamento e Ideação",
          cor: "#64748b",
          cartoes: [
            { titulo: "Roteiro do vídeo teaser de 60 segundos", prioridade: "alta", descricao: "Destaque para o design Glassmorphism e fluidez dos quadros." },
          ],
        },
        {
          titulo: "Criação de Conteúdo",
          cor: "#3b82f6",
          cartoes: [
            { titulo: "Landing page de demonstração", prioridade: "urgente", descricao: "Copywriting enfático na proposta de valor Notion + Trello." },
          ],
        },
        {
          titulo: "Distribuição",
          cor: "#8b5cf6",
          cartoes: [
            { titulo: "Publicação no Product Hunt e X/Twitter", prioridade: "alta", descricao: "Programar lançamento para terça-feira às 00:01 PT." },
          ],
        },
        {
          titulo: "Métricas Pós-Lançamento",
          cor: "#10b981",
          cartoes: [
            { titulo: "Análise de conversão e taxa de ativação", prioridade: "media", descricao: "Monitoramento dos primeiros 1.000 cadastros." },
          ],
        },
      ],
    },
  };

  const template = configs[tipo];
  if (!template) {
    return { sucesso: false, mensagem: "Template não encontrado." };
  }

  // 1. Cria o projeto
  const { data: projeto, error: erroProjeto } = await supabase
    .from("projetos")
    .insert({
      workspace_id: workspaceId,
      nome: template.nome,
      descricao: template.descricao,
      cor: template.cor,
      icone: "FolderKanban",
      publico: false,
    })
    .select("id")
    .single();

  if (erroProjeto || !projeto) {
    return { sucesso: false, mensagem: "Erro ao criar projeto a partir do template." };
  }

  // 2. Cria o quadro
  const { data: quadro, error: erroQuadro } = await supabase
    .from("quadros")
    .insert({
      projeto_id: projeto.id,
      workspace_id: workspaceId,
      nome: "Quadro Principal",
      posicao: 0,
    })
    .select("id")
    .single();

  if (erroQuadro || !quadro) {
    return { sucesso: false, mensagem: "Erro ao criar quadro do template." };
  }

  // 3. Cria as colunas e cartões
  for (let i = 0; i < template.colunas.length; i++) {
    const colConfig = template.colunas[i];
    const { data: coluna } = await supabase
      .from("colunas")
      .insert({
        quadro_id: quadro.id,
        titulo: colConfig.titulo,
        cor: colConfig.cor,
        posicao: i,
      })
      .select("id")
      .single();

    if (coluna && colConfig.cartoes.length > 0) {
      const cartoesParaInserir = colConfig.cartoes.map((cartao, idx) => ({
        coluna_id: coluna.id,
        workspace_id: workspaceId,
        criado_por: user?.id,
        titulo: cartao.titulo,
        descricao: cartao.descricao,
        prioridade: cartao.prioridade,
        status: "aberto" as const,
        posicao: idx,
      }));

      await supabase.from("cartoes").insert(cartoesParaInserir);
    }
  }

  revalidatePath(`/${workspaceId}/projetos`);
  return { sucesso: true, projetoId: projeto.id };
}

/**
 * Cria uma página a partir de um template estruturado em blocos ricos.
 */
export async function aplicarTemplatePagina(
  workspaceId: string,
  tipo: TipoTemplatePagina
) {
  const supabase = await criarClienteServidor();

  const configs: Record<
    TipoTemplatePagina,
    {
      titulo: string;
      conteudo: string;
    }
  > = {
    wiki_engenharia: {
      titulo: "Wiki de Engenharia & Arquitetura",
      conteudo: `
        <h1>Wiki de Engenharia & Padrões de Código</h1>
        <p>Este documento centraliza as diretrizes arquiteturais, convenções de desenvolvimento e boas práticas para manter a qualidade e velocidade do time.</p>
        <hr />
        <h2>1. Princípios de Engenharia</h2>
        <ul>
          <li><strong>Simplicidade antes de abstração:</strong> Não crie camadas desnecessárias até que haja repetição comprovada.</li>
          <li><strong>Segurança por padrão:</strong> Todo acesso ao banco deve ser blindado por Row Level Security (RLS).</li>
          <li><strong>Feedback imediato:</strong> Otimização de UI com atualizações otimistas e estados de carregamento elegantes.</li>
        </ul>
        <h2>2. Fluxo de Trabalho (Git & PRs)</h2>
        <ol>
          <li>Crie branches temáticas a partir da branch principal (ex: <code>feature/linha-do-tempo</code>).</li>
          <li>Garanta que <code>bunx tsc --noEmit</code> passe sem nenhum erro antes de abrir Pull Request.</li>
          <li>Escreva descrições objetivas focando no PORQUÊ da mudança.</li>
        </ol>
        <blockquote>"Código limpo é aquele que parece ter sido escrito por alguém que se importa." — Robert C. Martin</blockquote>
      `,
    },
    reuniao_ata: {
      titulo: "Ata de Reunião & Alinhamento Semanal",
      conteudo: `
        <h1>Ata de Alinhamento Estratégico</h1>
        <p><strong>Data:</strong> Reunião Semanal | <strong>Participantes:</strong> Time de Produto e Engenharia</p>
        <hr />
        <h2>Pauta da Reunião</h2>
        <ul>
          <li>Alinhamento do escopo da Fase 4: Colaboração em tempo real e Linha do Tempo.</li>
          <li>Revisão de performance das consultas RLS e índices no Supabase.</li>
          <li>Priorização dos próximos passos para o lançamento público.</li>
        </ul>
        <h2>Decisões Tomadas</h2>
        <ul>
          <li>Adoção do canal Postgres Changes no Supabase Realtime para sincronização de cartões.</li>
          <li>Liberação de modo somente leitura com token seguro para visualizações públicas.</li>
        </ul>
        <h2>Ações e Próximos Passos</h2>
        <ul data-type="taskList">
          <li data-checked="true">Configurar políticas de visitantes anônimos no banco de dados.</li>
          <li data-checked="false">Implementar componente de Linha do Tempo no visualizador do projeto.</li>
          <li data-checked="false">Testar sincronização entre duas abas abertas simultaneamente.</li>
        </ul>
      `,
    },
    especificacao_design: {
      titulo: "Especificação de Design System & UI/UX",
      conteudo: `
        <h1>Especificação de Design — Glassmorphism & Apple-inspired</h1>
        <p>Guia de estilo visual para manter harmonia, contraste e fluidez em todas as telas do VICCS Planner.</p>
        <hr />
        <h2>1. Superfícies & Materiais</h2>
        <p>Utilizamos a classe <code>superficie-glass</code> com desfoque de fundo (backdrop-filter) e bordas luminosas discretas (<code>var(--border)</code>).</p>
        <h2>2. Paleta Semântica</h2>
        <ul>
          <li><strong>Acentos primários:</strong> Azul e Violeta espacial com gradientes suaves.</li>
          <li><strong>Estados:</strong> Sucesso (Esmeralda), Alerta (Âmbar), Perigo (Rubi).</li>
        </ul>
        <h2>3. Regra Fundamental de Acessibilidade</h2>
        <p>O efeito de vidro é estético e decorativo; a legibilidade do texto e contraste WCAG AA são prioritários em ambos os temas (Claro e Escuro).</p>
      `,
    },
    planejamento_semanal: {
      titulo: "Planejamento Semanal de Produtividade",
      conteudo: `
        <h1>Planejamento da Semana</h1>
        <p>Defina suas maiores prioridades e acompanhe seus objetivos dia após dia.</p>
        <hr />
        <h2>Meta Principal da Semana (North Star)</h2>
        <blockquote>Entregar a experiência de colaboração e linha do tempo com 100% de precisão e fluidez visual.</blockquote>
        <h2>Segunda a Sexta</h2>
        <h3>Segunda-feira</h3>
        <ul data-type="taskList">
          <li data-checked="true">Planejar estrutura de componentes da Linha do Tempo.</li>
        </ul>
        <h3>Terça-feira</h3>
        <ul data-type="taskList">
          <li data-checked="true">Conectar WebSockets do Supabase Realtime para cartões.</li>
        </ul>
        <h3>Quarta-feira</h3>
        <ul data-type="taskList">
          <li data-checked="false">Finalizar páginas públicas anônimas para compartilhamento.</li>
        </ul>
        <h3>Quinta e Sexta-feira</h3>
        <ul data-type="taskList">
          <li data-checked="false">Auditoria completa de UX, temas e responsividade mobile.</li>
        </ul>
      `,
    },
  };

  const template = configs[tipo];
  if (!template) {
    return { sucesso: false, mensagem: "Template de página não encontrado." };
  }

  const { data, error } = await supabase
    .from("paginas")
    .insert({
      workspace_id: workspaceId,
      titulo: template.titulo,
      conteudo: template.conteudo,
      icone: "FileText",
      favorita: false,
      publico: false,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { sucesso: false, mensagem: "Erro ao criar página do template." };
  }

  revalidatePath(`/${workspaceId}/paginas`);
  return { sucesso: true, paginaId: data.id };
}
