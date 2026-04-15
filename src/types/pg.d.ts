declare module "pg" {
  export interface QueryResultRow {
    [column: string]: unknown;
  }

  export interface QueryResult<R extends QueryResultRow = QueryResultRow> {
    rows: R[];
  }

  export interface PoolConfig {
    connectionString?: string;
    [key: string]: unknown;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<R extends QueryResultRow = QueryResultRow>(
      text: string,
      params?: unknown[]
    ): Promise<QueryResult<R>>;
    end(): Promise<void>;
  }
}
