// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { browseChartsMachineAtom, browseChartsSolutionsLanguageAtom } from "@/features/charts/state/browse-charts";
import { useUrlScribe } from "@/hooks/use-url-scribe";

export function useBrowseCharts() {
  const browseChartsMachineEvent = useAtomSet(browseChartsMachineAtom);
  const { navigate, searchEntries } = useUrlScribe();
  const sl = useAtomValue(browseChartsSolutionsLanguageAtom);

  // `searchEntries` is memoized on the raw query string, so this re-syncs only
  // when the query actually changes — not on unrelated router notifications
  useEffect(() => {
    browseChartsMachineEvent({ type: "urlSynced", browseCharts: searchEntries, navigate });
  }, [browseChartsMachineEvent, navigate, searchEntries]);

  return { sl, browseChartsMachineEvent } as const;
}
