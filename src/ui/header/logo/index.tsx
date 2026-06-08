// next
import Link from "next/link";

// assets
import { LogoIcon } from "@/assets/icons";

export default function Logo() {
  return (
    <Link href="/" title="Wordle Overdrive" className="flex-none">
      <LogoIcon className="size-13" />
    </Link>
  );
}
