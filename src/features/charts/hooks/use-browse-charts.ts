// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { browseChartsMachineSendAtom, browseChartsSolutionsLanguageAtom } from "@/features/charts/state/browse-charts";
import { decodeBrowseCharts } from "@/features/charts/machines/browse-charts/helpers";
import { useUrlScribe } from "@/hooks/use-url-scribe";

export function useBrowseCharts() {
  const browseChartsMachineEvent = useAtomSet(browseChartsMachineSendAtom);
  const { navigate, searchEntries } = useUrlScribe();
  const sl = useAtomValue(browseChartsSolutionsLanguageAtom);

  useEffect(() => {
    browseChartsMachineEvent({ type: "urlSynced", browseCharts: decodeBrowseCharts(searchEntries), navigate });
  }, [browseChartsMachineEvent, navigate, searchEntries]);

  return { sl, browseChartsMachineEvent } as const;
}
