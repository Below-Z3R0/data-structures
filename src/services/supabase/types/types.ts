// =============================================================================
// TIPOS DE SUPABASE — schema public
// =============================================================================
// Generar con:
//   bunx supabase gen types typescript --project-id <PROJECT_ID> --schema public //     > src/services/supabase/types/types.ts
//
// Si regenerás el archivo, mantené el shape de `Database` con la clave
// "public" y la funcion `get_site_payload`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      languages: {
        Row: {
          code: string;
          create_at: string | null;
          is_default: boolean | null;
          name: string;
        };
        Insert: {
          code: string;
          create_at?: string | null;
          is_default?: boolean | null;
          name: string;
        };
        Update: {
          code?: string;
          create_at?: string | null;
          is_default?: boolean | null;
          name?: string;
        };
        Relationships: [];
      };
      content_blocks: {
        Row: {
          create_at: string | null;
          description: string | null;
          id: string;
          key: string;
          owner: string;
        };
        Insert: {
          create_at?: string | null;
          description?: string | null;
          id?: string;
          key: string;
          owner?: string;
        };
        Update: {
          create_at?: string | null;
          description?: string | null;
          id?: string;
          key?: string;
          owner?: string;
        };
        Relationships: [];
      };
      content_blocks_metadata: {
        Row: {
          block_id: string;
          content: Json;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          block_id: string;
          content: Json;
          id?: string;
          updated_at?: string | null;
        };
        Update: {
          block_id?: string;
          content?: Json;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "content_blocks_metadata_block_id_fkey";
            columns: ["block_id"];
            isOneToOne: true;
            referencedRelation: "content_blocks";
            referencedColumns: ["id"];
          },
        ];
      };
      translations: {
        Row: {
          block_id: string | null;
          content: Json;
          id: string;
          lang_code: string | null;
          updated_at: string | null;
        };
        Insert: {
          block_id?: string | null;
          content: Json;
          id?: string;
          lang_code?: string | null;
          updated_at?: string | null;
        };
        Update: {
          block_id?: string | null;
          content?: Json;
          id?: string;
          lang_code?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "translations_block_id_fkey";
            columns: ["block_id"];
            isOneToOne: false;
            referencedRelation: "content_blocks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "translations_lang_code_fkey";
            columns: ["lang_code"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["code"];
          },
        ];
      };
      profiles: {
        Row: {
          email: string | null;
          id: string;
          role: string | null;
          updated_at: string | null;
          username: Json | null;
        };
        Insert: {
          email?: string | null;
          id: string;
          role?: string | null;
          updated_at?: string | null;
          username?: Json | null;
        };
        Update: {
          email?: string | null;
          id?: string;
          role?: string | null;
          updated_at?: string | null;
          username?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_site_payload: {
        Args: {
          p_lang: string;
          p_keys?: string[];
        };
        Returns: Json;
      };
      get_translation_by_key: {
        Args: {
          block_key: string;
          lang: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

/** Schema por defecto de la app. */
type DefaultSchema = DatabaseWithoutInternals["public"];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][EnumName & keyof DefaultSchema["Enums"]]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][CompositeTypeName &
        keyof DefaultSchema["CompositeTypes"]]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
