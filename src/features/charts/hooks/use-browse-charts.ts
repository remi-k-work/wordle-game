// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { browseChartsMachineAtom, browseChartsSolutionsLanguageAtom } from "@/features/charts/state/browse-charts";
import { decodeBrowseCharts } from "@/features/charts/domain/helpers";
import { useUrlScribe } from "@/hooks/use-url-scribe";

export function useBrowseCharts() {
  const browseChartsMachineEvent = useAtomSet(browseChartsMachineAtom);
  const { navigate, searchEntries } = useUrlScribe();
  const sl = useAtomValue(browseChartsSolutionsLanguageAtom);

  // `searchEntries` is memoized on the raw query string, so this re-syncs only
  // when the query actually changes — not on unrelated router notifications.
  // The entries are schema-decoded here so the machine context only ever holds
  // a validated language (an invalid `sl` falls back to the initial value)
  useEffect(() => {
    browseChartsMachineEvent({ type: "urlSynced", browseCharts: decodeBrowseCharts(searchEntries), navigate });
  }, [browseChartsMachineEvent, navigate, searchEntries]);

  return { sl, browseChartsMachineEvent } as const;
}
