import { supabase } from "../../services/supabase/client";

export type QueryResult = {
  data: unknown;
  error: Error | null;
  count?: number | null;
};

const METHODS = [
  "select",
  "insert",
  "update",
  "delete",
  "eq",
  "neq",
  "or",
  "contains",
  "order",
  "range",
  "limit",
  "offset",
  "single",
  "maybeSingle",
];

/**
 * Builds a Supabase query-builder mock.
 * Every chained method returns the same builder, which is thenable and
 * resolves to the given result (mimics PostgrestBuilder's .then()).
 */
export function mockQueryBuilder(result: QueryResult) {
  const builder: Record<string, any> = {};
  builder.then = (
    onFulfilled: (value: any) => any,
    onRejected: (reason?: any) => any,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  for (const name of METHODS) {
    builder[name] = jest.fn().mockReturnValue(builder);
  }
  return builder;
}

/**
 * Wires supabase.from() / supabase.rpc() to return a thenable builder that
 * resolves to the given result. Returns the builder for chain assertions.
 */
export function setSupabaseMock(result: QueryResult) {
  const builder = mockQueryBuilder(result);
  (supabase.from as jest.Mock).mockReturnValue(builder);
  (supabase.rpc as jest.Mock).mockReturnValue(builder);
  return builder;
}

export const ok = <T,>(data: T, count: number | null = null): QueryResult => ({
  data,
  error: null,
  count,
});

export const fail = (message: string): QueryResult => ({
  data: null,
  error: new Error(message),
});