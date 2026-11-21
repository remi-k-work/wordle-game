// react
import { useCallback, useMemo } from "react";

// tanstack
import { useNavigate, useRouterState } from "@tanstack/react-router";

// services, features, and other libraries
import { Predicate, Record } from "effect";

// Define a more convenient type for the params object
type QueryValue = Readonly<string | number | (string | number)[]>;
type QueryParams = Record.ReadonlyRecord<string, QueryValue>;

// Define the overload signatures interface
interface NavigateFn {
  (newRoute: string): void;
  (paramsToSet: QueryParams): void;
  (newRoute: string, paramsToSet: QueryParams): void;
}

// Stringifies a param the way `URLSearchParams` would: arrays are comma-joined and
// numbers are rendered in base 10. `Predicate`'s guards (rather than hand-written
// `typeof` checks) narrow the union, so a variant that cannot be serialized is a
// compile error instead of a silent `undefined`
const serialize = (value: QueryValue) => (Predicate.isString(value) ? value : Predicate.isNumber(value) ? String(value) : value.join(","));

// Merges `paramsToSet` into the current search, mirroring the old URLSearchParams
// behavior: values are stringified (arrays joined with `,`) and empty strings delete.
// Immutable Record operations (set/remove copy on write) instead of a mutating
// loop over a spread copy
const applyParams = (current: Record.ReadonlyRecord<string, string | undefined>, values: QueryParams): Record.ReadonlyRecord<string, string | undefined> =>
  Record.reduce(values, current, (acc, value, key) => {
    const serialized = serialize(value);
    return serialized === "" ? Record.remove(acc, key) : Record.set(acc, key, serialized);
  });

// A hook to programmatically navigate to a new url with updated search parameters
// (it preserves existing search params: TanStack Router keeps the current search
// unless the key is explicitly overwritten by `paramsToSet`)
export function useUrlScribe() {
  const navigateFn = useNavigate();

  // Subscribe to the primitive query string, then parse it once into the entries
  // memoized on that string (rerender-dependencies: selecting the parsed object
  // directly would allocate a fresh identity on every router-store notification
  // and re-render consumers on unrelated navigations)
  // Parsing here — rather than exposing a `URLSearchParams` for consumers to
  // re-serialize and re-parse — keeps exactly one representation of the current
  // search in the app, and leaves this module the only place that knows how a
  // query string is turned into component-readable data
  const searchStr = useRouterState({ select: ({ location }) => location.searchStr });
  // `Record.fromEntries` (not `Object.fromEntries`) types every entry value as
  // `string` by construction, so a hand-edited query value cannot leak `any`
  // into a consumer's typed model and no explicit type argument is needed
  const searchEntries = useMemo(() => Record.fromEntries(new URLSearchParams(searchStr)), [searchStr]);

  // Programmatically navigates to a new url with updated search params
  const navigate = useCallback(
    (arg1?: string | QueryParams, arg2?: QueryParams) => {
      // Detect if the first arg is a route (string) or query params (object)
      const newRoute = Predicate.isString(arg1) ? arg1 : undefined;
      const paramsToSet = Predicate.isString(arg1) ? arg2 : arg1;

      // Search updates merge into the existing url state; only modified keys change.
      // (One cast, exactly here: navigate's search reducer is typed against the
      // router registry, while the hook keeps the loose QueryParams contract the
      // browse-charts machine passes raw string values through)
      void navigateFn({
        to: newRoute,
        search: (prev: Record.ReadonlyRecord<string, string | undefined>) => applyParams(prev, paramsToSet ?? {}),
      } as Parameters<typeof navigateFn>[0]);
    },
    [navigateFn]
  );

  // We cast `navigate` to the appropriate type, which ensures that components using the hook see the nice, strict overloads
  return { navigate: navigate as NavigateFn, searchEntries };
}
