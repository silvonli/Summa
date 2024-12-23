declare namespace chrome {
  export namespace offscreen {
    export function createDocument(options: {
      url: string;
      reasons: string[];
      justification: string;
    }): Promise<void>;

    export function closeDocument(): Promise<void>;
  }

  export namespace runtime {
    export function getContexts(options: {
      contextTypes: string[];
    }): Promise<Array<{
      contextType: string;
      documentId?: string;
    }>>;
  }
} 