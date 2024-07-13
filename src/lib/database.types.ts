export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: number;
          url: string;
          title: string;
          description: string;
          links: Json;
          image: string;
          content: string;
          author: string;
          favicon: string;
          source: string;
          published: string;
          ttr: number;
          type: string;
          embedding: Json;
        };
        Insert: {
          id?: never;
          url: string;
          title: string;
          description: string;
          links: Json;
          image: string;
          content: string;
          author: string;
          favicon: string;
          source: string;
          published: string;
          ttr: number;
          type: string;
          embedding: Json;
        };
        Update: {
          id?: never;
          url?: string;
          title?: string;
          description?: string;
          links?: Json;
          image?: string;
          content?: string;
          author?: string;
          favicon?: string;
          source?: string;
          published?: string;
          ttr?: number;
          type?: string;
          embedding?: Json;
        };
      }
    }
  }
}