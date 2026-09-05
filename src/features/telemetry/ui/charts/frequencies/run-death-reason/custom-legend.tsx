// services, features, and other libraries
import { T } from "gt-next";

export const CustomLegend = () => (
  <div className="flex flex-col items-center font-sans text-text-2">
    <div className="flex items-center gap-2">
      <div className="size-4 bg-(--color-primary)" />
      <T>Your Runs (Inner)</T>
    </div>
    <div className="flex items-center gap-2">
      <div className="size-4 bg-(--color-secondary)" />
      <T>Global Base (Outer)</T>
    </div>
  </div>
);
