// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { InfoLine } from "@/ui/info-line";

// Renders the "no data yet" state — a single centered info line
export function BestRunCardEmpty() {
  const gt = useGT();

  return <InfoLine className="row-span-6 font-normal" message={gt("No completed runs yet!")} />;
}
