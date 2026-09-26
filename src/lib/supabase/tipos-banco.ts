export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string;
          nome_completo: string | null;
          avatar_url: string | null;
          email: string;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id: string;
          nome_completo?: string | null;
          avatar_url?: string | null;
          email: string;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          nome_completo?: string | null;
          avatar_url?: string | null;
          email?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          criado_por: string | null;
          nome: string;
          slug: string;
          descricao: string | null;
          icone_url: string | null;
          tipo: "pessoal" | "equipe";
          configuracoes: Json;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          criado_por?: string | null;
          nome: string;
          slug: string;
          descricao?: string | null;
          icone_url?: string | null;
          tipo?: "pessoal" | "equipe";
          configuracoes?: Json;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          criado_por?: string | null;
          nome?: string;
          slug?: string;
          descricao?: string | null;
          icone_url?: string | null;
          tipo?: "pessoal" | "equipe";
          configuracoes?: Json;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      membros_workspace: {
        Row: {
          id: string;
          workspace_id: string;
          usuario_id: string;
          papel: "proprietario" | "admin" | "membro" | "convidado";
          criado_em: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          usuario_id: string;
          papel?: "proprietario" | "admin" | "membro" | "convidado";
          criado_em?: string;
        };
        Update: {
          papel?: "proprietario" | "admin" | "membro" | "convidado";
        };
        Relationships: [];
      };
      paginas: {
        Row: {
          id: string;
          workspace_id: string;
          pagina_pai_id: string | null;
          criado_por: string | null;
          titulo: string;
          icone: string;
          conteudo: Json;
          posicao: number;
          favorita: boolean;
          arquivada: boolean;
          publico: boolean;
          token_publico: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          pagina_pai_id?: string | null;
          criado_por?: string | null;
          titulo?: string;
          icone?: string;
          conteudo?: Json;
          posicao?: number;
          favorita?: boolean;
          arquivada?: boolean;
          publico?: boolean;
          token_publico?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          workspace_id?: string;
          pagina_pai_id?: string | null;
          titulo?: string;
          icone?: string;
          conteudo?: Json;
          posicao?: number;
          favorita?: boolean;
          arquivada?: boolean;
          publico?: boolean;
          token_publico?: string | null;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      projetos: {
        Row: {
          id: string;
          workspace_id: string;
          criado_por: string | null;
          nome: string;
          descricao: string | null;
          icone: string;
          cor: string;
          arquivado: boolean;
          publico: boolean;
          token_publico: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          criado_por?: string | null;
          nome: string;
          descricao?: string | null;
          icone?: string;
          cor?: string;
          arquivado?: boolean;
          publico?: boolean;
          token_publico?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          nome?: string;
          descricao?: string | null;
          icone?: string;
          cor?: string;
          arquivado?: boolean;
          publico?: boolean;
          token_publico?: string | null;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      quadros: {
        Row: {
          id: string;
          projeto_id: string;
          workspace_id: string;
          nome: string;
          posicao: number;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          projeto_id: string;
          workspace_id: string;
          nome?: string;
          posicao?: number;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          nome?: string;
          posicao?: number;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      colunas: {
        Row: {
          id: string;
          quadro_id: string;
          titulo: string;
          cor: string;
          posicao: number;
          limite_wip: number | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          quadro_id: string;
          titulo: string;
          cor?: string;
          posicao?: number;
          limite_wip?: number | null;
          criado_em?: string;
        };
        Update: {
          titulo?: string;
          cor?: string;
          posicao?: number;
          limite_wip?: number | null;
        };
        Relationships: [];
      };
      cartoes: {
        Row: {
          id: string;
          coluna_id: string;
          workspace_id: string;
          criado_por: string | null;
          titulo: string;
          descricao: string | null;
          prioridade: "nenhuma" | "baixa" | "media" | "alta" | "urgente";
          status: "aberto" | "em_progresso" | "concluido" | "arquivado";
          data_inicio: string | null;
          data_vencimento: string | null;
          posicao: number;
          arquivado: boolean;
          metadados: Json;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          coluna_id: string;
          workspace_id: string;
          criado_por?: string | null;
          titulo: string;
          descricao?: string | null;
          prioridade?: "nenhuma" | "baixa" | "media" | "alta" | "urgente";
          status?: "aberto" | "em_progresso" | "concluido" | "arquivado";
          data_inicio?: string | null;
          data_vencimento?: string | null;
          posicao?: number;
          arquivado?: boolean;
          metadados?: Json;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          coluna_id?: string;
          titulo?: string;
          descricao?: string | null;
          prioridade?: "nenhuma" | "baixa" | "media" | "alta" | "urgente";
          status?: "aberto" | "em_progresso" | "concluido" | "arquivado";
          data_inicio?: string | null;
          data_vencimento?: string | null;
          posicao?: number;
          arquivado?: boolean;
          metadados?: Json;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      checklists: {
        Row: {
          id: string;
          cartao_id: string;
          titulo: string;
          posicao: number;
          criado_em: string;
        };
        Insert: {
          id?: string;
          cartao_id: string;
          titulo?: string;
          posicao?: number;
          criado_em?: string;
        };
        Update: {
          titulo?: string;
          posicao?: number;
        };
        Relationships: [];
      };
      itens_checklist: {
        Row: {
          id: string;
          checklist_id: string;
          texto: string;
          concluido: boolean;
          posicao: number;
          criado_em: string;
        };
        Insert: {
          id?: string;
          checklist_id: string;
          texto: string;
          concluido?: boolean;
          posicao?: number;
          criado_em?: string;
        };
        Update: {
          texto?: string;
          concluido?: boolean;
          posicao?: number;
        };
        Relationships: [];
      };
      etiquetas: {
        Row: {
          id: string;
          workspace_id: string;
          nome: string;
          cor: string;
          criado_em: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          nome: string;
          cor?: string;
          criado_em?: string;
        };
        Update: {
          nome?: string;
          cor?: string;
        };
        Relationships: [];
      };
      atividades: {
        Row: {
          id: string;
          workspace_id: string;
          ator_id: string | null;
          acao: string;
          recurso_tipo: string;
          recurso_id: string;
          detalhes: Json;
          criado_em: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          ator_id?: string | null;
          acao: string;
          recurso_tipo: string;
          recurso_id: string;
          detalhes?: Json;
          criado_em?: string;
        };
        Update: {
          detalhes?: Json;
        };
        Relationships: [];
      };
      bancos_dados: {
        Row: {
          id: string;
          workspace_id: string;
          criado_por: string | null;
          nome: string;
          descricao: string | null;
          icone: string;
          visao_padrao: "tabela" | "galeria" | "lista";
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          criado_por?: string | null;
          nome?: string;
          descricao?: string | null;
          icone?: string;
          visao_padrao?: "tabela" | "galeria" | "lista";
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          nome?: string;
          descricao?: string | null;
          icone?: string;
          visao_padrao?: "tabela" | "galeria" | "lista";
          atualizado_em?: string;
        };
        Relationships: [];
      };
      propriedades_banco: {
        Row: {
          id: string;
          banco_id: string;
          nome: string;
          tipo: string;
          ordem: number;
          configuracoes: Json;
          criado_em: string;
        };
        Insert: {
          id?: string;
          banco_id: string;
          nome: string;
          tipo: string;
          ordem?: number;
          configuracoes?: Json;
          criado_em?: string;
        };
        Update: {
          nome?: string;
          tipo?: string;
          ordem?: number;
          configuracoes?: Json;
        };
        Relationships: [];
      };
      registros_banco: {
        Row: {
          id: string;
          banco_id: string;
          criado_por: string | null;
          titulo: string;
          icone: string;
          valores: Json;
          conteudo: Json;
          ordem: number;
          arquivado: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          banco_id: string;
          criado_por?: string | null;
          titulo?: string;
          icone?: string;
          valores?: Json;
          conteudo?: Json;
          ordem?: number;
          arquivado?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          titulo?: string;
          icone?: string;
          valores?: Json;
          conteudo?: Json;
          ordem?: number;
          arquivado?: boolean;
          atualizado_em?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      eh_membro_workspace: {
        Args: { p_workspace_id: string };
        Returns: boolean;
      };
      eh_admin_workspace: {
        Args: { p_workspace_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
