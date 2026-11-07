// components
import { InfoLine } from "@/ui/info-line";
import { SectionHeader } from "@/ui/section-header";

// types
interface ChartEmptyProps {
  title: string;
  message: string;
}

// The state every chart falls back to when its rows resolve to nothing
export function ChartEmpty({ title, message }: ChartEmptyProps) {
  return (
    <>
      <SectionHeader title={title} />
      <InfoLine message={message} />
    </>
  );
}
