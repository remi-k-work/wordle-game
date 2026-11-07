// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { runClientCommand } from "@/lib/runtime-client";
import { alertIsForfeitRunAtom } from "@/state/alert";
import { confirmForfeitRun } from "@/features/game/state/actions";
import { useGT } from "gt-react";

// components
import { Alert } from "@/ui/alert";
import { Content } from "./content";

export function ForfeitRunAlert() {
  // Derived boolean atom: re-renders only when visibility actually flips
  const isOpen = useAtomValue(alertIsForfeitRunAtom);
  const gt = useGT();

  return (
    <Alert isOpen={isOpen} title={gt("Forfeit Run")} onOkayed={() => runClientCommand(confirmForfeitRun)}>
      <Content />
    </Alert>
  );
}
