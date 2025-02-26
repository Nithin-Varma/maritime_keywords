export interface Database {
  public: {
    Tables: {
      keywords: {
        Row: {
          id: number;
          term: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          term: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          term?: string;
          category?: string;
          created_at?: string;
        };
      };
    };
  };
}