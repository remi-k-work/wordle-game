// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { alertIsForfeitRunAtom } from "@/state/alert";
import { confirmForfeitRunAtom } from "@/features/game/state/run-session";
import { useGT } from "gt-react";

// components
import { Alert } from "@/ui/alert";
import { Content } from "./content";

export function ForfeitRunAlert() {
  // Derived boolean atom: re-renders only when visibility actually flips
  const isOpen = useAtomValue(alertIsForfeitRunAtom);
  const confirmForfeitRun = useAtomSet(confirmForfeitRunAtom);
  const gt = useGT();

  return (
    <Alert isOpen={isOpen} title={gt("Forfeit Run")} onOkayed={() => confirmForfeitRun()}>
      <Content />
    </Alert>
  );
}
