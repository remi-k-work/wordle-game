// react
import { useCallback, useMemo } from "react";

// tanstack
import { useNavigate, useRouterState } from "@tanstack/react-router";

// Define a more convenient type for the params object
type QueryValue = Readonly<string | number | (string | number)[]>;
type QueryParams = Readonly<Record<string, QueryValue>>;

// Define the overload signatures interface
interface NavigateFn {
  (newRoute: string): void;
  (paramsToSet: QueryParams): void;
  (newRoute: string, paramsToSet: QueryParams): void;
}

// Merges `paramsToSet` into the current search, mirroring the old URLSearchParams
// behavior: values are stringified (arrays joined with `,`) and empty strings delete
const applyParams = (current: Record<string, string | undefined>, values: QueryParams): Record<string, string | undefined> => {
  const next = { ...current };
  for (const [key, value] of Object.entries(values)) {
    const serialized = typeof value === "string" ? value : typeof value === "number" ? String(value) : value.join(",");
    if (serialized === "") delete next[key];
    else next[key] = serialized;
  }
  return next;
};

// A hook to programmatically navigate to a new url with updated search parameters
// (it preserves existing search params: TanStack Router keeps the current search
// unless the key is explicitly overwritten by `paramsToSet`)
export function useUrlScribe() {
  const navigateFn = useNavigate();

  // Subscribe to the primitive query string, then parse it into a URLSearchParams
  // memoized on that string (rerender-dependencies: selecting the parsed object
  // directly would allocate a fresh identity on every router-store notification
  // and re-render consumers on unrelated navigations)
  const searchStr = useRouterState({ select: ({ location }) => location.searchStr });
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr]);

  // Programmatically navigates to a new url with updated search params
  const navigate = useCallback(
    (arg1?: string | QueryParams, arg2?: QueryParams) => {
      // Detect if the first arg is a route (string) or query params (object)
      const newRoute = typeof arg1 === "string" ? arg1 : undefined;
      const paramsToSet = typeof arg1 === "string" ? arg2 : arg1;

      // Search updates merge into the existing url state; only modified keys change.
      // (One cast, exactly here: navigate's search reducer is typed against the
      // router registry, while the hook keeps the loose QueryParams contract the
      // browse-charts machine passes raw string values through)
      void navigateFn({
        to: newRoute,
        search: (prev: Record<string, string | undefined>) => applyParams(prev, paramsToSet ?? {}),
      } as unknown as Parameters<typeof navigateFn>[0]);
    },
    [navigateFn]
  );

  // We cast the functions to the appropriate types, which ensures that components using the hook see the nice, strict overloads
  return { navigate: navigate as NavigateFn, searchParams } as const;
}
