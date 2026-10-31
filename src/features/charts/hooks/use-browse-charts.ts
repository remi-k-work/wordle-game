// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { browseChartsMachineAtom, browseChartsSolutionsLanguageAtom } from "@/features/telemetry/state/browse-charts";
import { useUrlScribe } from "@/hooks/use-url-scribe";

export function useBrowseCharts() {
  const browseChartsMachineEvent = useAtomSet(browseChartsMachineAtom);
  const { navigate, searchParams } = useUrlScribe();
  const sl = useAtomValue(browseChartsSolutionsLanguageAtom);

  // Serialized query string (a primitive): re-sync only when the actual query
  // changes, not on unrelated renders. Entries are derived from the same string
  // so the dispatched payload always matches the dep
  const searchParamsKey = searchParams.toString();

  useEffect(() => {
    browseChartsMachineEvent({ type: "urlSynced", browseCharts: Object.fromEntries(new URLSearchParams(searchParamsKey).entries()), navigate });
  }, [browseChartsMachineEvent, navigate, searchParamsKey]);

  return { sl, browseChartsMachineEvent } as const;
}
