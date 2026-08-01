// react
import { useCallback } from "react";

// next
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// types
import type { Route } from "next";

// Define a more convenient type for the params object
type QueryValue = Readonly<string | number | (string | number)[]>;
type QueryParams = Readonly<Record<string, QueryValue>>;

// Define the overload signatures interface
interface CreateHrefFn {
  (newRoute: Route): Route;
  (paramsToSet: QueryParams): Route;
  (newRoute: Route, paramsToSet: QueryParams): Route;
}

interface NavigateFn {
  (newRoute: Route): void;
  (paramsToSet: QueryParams): void;
  (newRoute: Route, paramsToSet: QueryParams): void;
}

// Merges `paramsToSet` into the current search params, handling array values (joined with `,`), empty-string deletion, and numeric coercion
function applyParams(params: URLSearchParams, paramsToSet: QueryParams): void {
  for (const [key, value] of Object.entries(paramsToSet)) {
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(","));
      else params.delete(key);
    } else if (typeof value === "string") {
      if (value.trim().length > 0) params.set(key, value);
      else params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }
}

// A hook to easily create new route strings with updated search parameters (it preserves existing search params)
export function useUrlScribe() {
  // Access next.js routing utilities
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Builds a new href string by adding/updating the provided search params
  const createHref = useCallback(
    (arg1?: Route | QueryParams, arg2?: QueryParams): Route => {
      // Create a mutable copy of the current search params
      const params = new URLSearchParams(searchParams.toString());

      // Detect if the first arg is a Route (string) or QueryParams (object)
      const newRoute = typeof arg1 === "string" ? arg1 : undefined;
      const paramsToSet = typeof arg1 === "string" ? arg2 : arg1;

      // Only modify params if an object was provided
      if (paramsToSet) applyParams(params, paramsToSet);

      // Return the new href and do not include the search params if they are empty (the "?" becomes unnecessary)
      const query = params.toString();
      const base = newRoute ?? pathname;
      return (query.length > 0 ? `${base}?${query}` : base) as Route;
    },
    [pathname, searchParams]
  );

  // Programmatically navigates to a new url with updated search params
  const navigate = useCallback(
    (arg1?: Route | QueryParams, arg2?: QueryParams) => router.push(createHref(arg1, arg2), { scroll: false }),
    [router, createHref]
  );

  // We cast the functions to the appropriate types, which ensures that components using the hook see the nice, strict overloads
  return { createHref: createHref as CreateHrefFn, navigate: navigate as NavigateFn, searchParams } as const;
}
