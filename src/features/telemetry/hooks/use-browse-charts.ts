// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { browseChartsMachineAtom, browseChartsSolutionsLanguageAtom } from "@/features/telemetry/state";
import { useUrlScribe } from "@/hooks";

export function useBrowseCharts() {
  const browseChartsMachineEvent = useAtomSet(browseChartsMachineAtom);
  const { navigate, searchParams } = useUrlScribe();
  const sl = useAtomValue(browseChartsSolutionsLanguageAtom);

  useEffect(() => {
    browseChartsMachineEvent({ type: "urlSynced", browseCharts: Object.fromEntries(searchParams.entries()), navigate });
  }, [browseChartsMachineEvent, navigate, searchParams]);

  return { sl, browseChartsMachineEvent } as const;
}
