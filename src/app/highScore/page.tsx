// components
import { PageHeader } from "@/ui/PageHeader";
import { NewHighScore } from "@/ui/Modals/WinOrLose/NewHighScore";

export default function Page() {
  return (
    <>
      <PageHeader title="High Score" description="Top 10 scores, sorted by score and streak." />

      <NewHighScore />
    </>
  );
}
